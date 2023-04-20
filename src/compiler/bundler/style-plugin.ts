import path from 'path'

import {type FileImporter} from 'sass'
import postcss, {type AcceptedPlugin, type ProcessOptions} from 'postcss'
import cssModules from 'postcss-modules'
import type {OnLoadArgs, OnLoadResult, OnResolveArgs, OnResolveResult, PluginBuild} from 'esbuild'

import type CssModulesOptions from './style-plugin-css-modules-options'
import {addPostCSSWatchFiles, importPostcssConfigFile, type RenderOptions, renderStyle} from './style-plugin-render'
import projectRoot from '../../utils/project-root'
import resolveImportFileSpecifier from '../helpers/resolve-import-file-specifier'
import {addMarker} from '../profiler.js'

interface PostCSS extends ProcessOptions {
    plugins: AcceptedPlugin[]
}

interface PluginOptions {
    extract?: boolean
    cssModulesMatch?: RegExp
    cssModulesOptions?: CssModulesOptions
    postcss?: PostCSS
    postcssConfigFile?: string | boolean
    renderOptions?: RenderOptions
}

const LOAD_TEMP_NAMESPACE = 'temp_stylePlugin'
const LOAD_STYLE_NAMESPACE = 'stylePlugin'
const SKIP_RESOLVE = 'esbuild-style-plugin-skipResolve'
export const styleFilter = /\.((c|s[ac]|le)ss|styl)$/

const handleCSSModules = (mapping: { data: any }, cssModulesOptions: CssModulesOptions) => {
    const _getJSON = cssModulesOptions.getJSON

    return cssModules({
        ...cssModulesOptions,
        getJSON: (cssFilename, json, outputFilename) => {
            if (typeof _getJSON === 'function') _getJSON(cssFilename, json, outputFilename)
            mapping.data = JSON.stringify(json, null, 2)
        }
    })
}

async function onStyleResolve(build: PluginBuild, args: OnResolveArgs): Promise<OnResolveResult> {
    if (args.pluginData === SKIP_RESOLVE ||
        args.namespace === LOAD_STYLE_NAMESPACE ||
        args.namespace === LOAD_TEMP_NAMESPACE
    ) return

    const result = await build.resolve(args.path, {
        resolveDir: args.resolveDir,
        pluginData: SKIP_RESOLVE,
        kind: args.kind
    })
    if (result.errors.length > 0) return {errors: result.errors}
    const fullPath = result.path
    // Check for pre compiled JS files like file.css.js
    if (!fullPath.endsWith('.js')) return

    return {
        path: fullPath,
        namespace: LOAD_STYLE_NAMESPACE,
        watchFiles: [fullPath]
    }
}

const projectRootNoLeading = projectRoot.startsWith('/') ? projectRoot.substring(1) : projectRoot
const makePathRelative = filePath => {
    if (filePath.startsWith('file://'))
        filePath = filePath.substring(7)
    if (filePath.startsWith(projectRootNoLeading))
        filePath = filePath.substring(projectRootNoLeading.length)

    if (!filePath.startsWith('/'))
        filePath = '/' + filePath
    if (!filePath.startsWith('.'))
        filePath = '.' + filePath

    return filePath
}

const findNodeModulesFileUrl: FileImporter<'sync'> = {
    findFileUrl(url) {
        if (!url.startsWith('~')) return null
        return new URL(resolveImportFileSpecifier(null, url.substring(1)), 'file://')
    }
}

async function onStyleLoad(options: PluginOptions, args: OnLoadArgs): Promise<OnLoadResult> {
    addMarker('bundler', `load-style-${path.basename(args.path)}-start`)

    const isCSSModule = options.cssModulesMatch
        ? args.path.match(options.cssModulesMatch)
        : (args.path.endsWith('module.css') || args.path.endsWith('module.scss') || args.path.endsWith('module.sass'))
    const cssModulesOptions = options.cssModulesOptions || {}
    const renderOptions = options.renderOptions

    if (!renderOptions.sassOptions.importers)
        renderOptions.sassOptions.importers = []
    renderOptions.sassOptions.importers.push(findNodeModulesFileUrl)

    addMarker('bundler', `render-style-${path.basename(args.path)}`)
    // Render whatever style currently on the loader .css, .sass, .styl, .less
    let {css, map} = await renderStyle(args.path, renderOptions)
    if (map) {
        map.file = makePathRelative(args.path)
        map.file = map.file.substring(0, map.file.lastIndexOf('.')) + '.rendered.css'
    }

    let watchFiles = []
    let mapping = {data: {}}
    const processOptions = options.postcss ?? {} as PostCSS
    let plugins = processOptions.plugins
    delete processOptions.plugins

    // Match file with extension .module. => styles.module.sass
    if (isCSSModule) {
        plugins ??= []
        plugins.unshift(handleCSSModules(mapping, cssModulesOptions))
    }

    addMarker('bundler', `postcss-${path.basename(args.path)}`)
    // Makes no sense to process postcss if we don't have any plugins
    if (plugins && plugins.length > 0) {
        const result = await postcss(plugins).process(css, {
            ...processOptions,
            from: args.path,
            map: {prev: map},
        })
        addMarker('bundler', `done-postcss-${path.basename(args.path)}`)
        css = result.css
        const sourceMap = result.map?.toJSON()
        if (sourceMap) {
            sourceMap.sources = sourceMap.sources.map(makePathRelative)
            sourceMap.file = sourceMap.file.substring(0, sourceMap.file.lastIndexOf('.')) + '.postcss.css'
            delete sourceMap.sourcesContent[1]
            delete sourceMap.sources[1]
            css += "\n"
            css += `/*# sourceMappingURL=data:application/json;base64,${new Buffer(JSON.stringify(sourceMap)).toString('base64')} */`
        }

        addPostCSSWatchFiles(watchFiles, result)
    }
    addMarker('bundler', `load-style-${path.basename(args.path)}-end`)

    return {
        watchFiles,
        resolveDir: path.dirname(args.path),
        contents: css,
        loader: 'css'
    }
}

const stylePlugin = (options: PluginOptions = {}) => ({
    name: 'esbuild-style-plugin',
    setup: async (build: PluginBuild) => {
        if (options.postcssConfigFile) {
            console.log(`Using postcss config file.`)
            options.postcss = await importPostcssConfigFile(options.postcssConfigFile)
        }

        build.onResolve({filter: styleFilter}, onStyleResolve.bind(null, build))
        build.onLoad({filter: /./, namespace: LOAD_STYLE_NAMESPACE}, onStyleLoad.bind(null, options))
    }
})

export default stylePlugin
