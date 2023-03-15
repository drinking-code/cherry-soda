import {createHash} from 'crypto'
import path from 'path'
import postcss, {AcceptedPlugin, ProcessOptions} from 'postcss'
import cssModules from 'postcss-modules'
import {OnLoadArgs, OnLoadResult, OnResolveArgs, OnResolveResult, PluginBuild} from 'esbuild'

import CssModulesOptions from './style-plugin-css-modules-options'
// import './modules' // keep this import for enabling modules types declaration ex: import styles from 'styles.module.sass'
import {getPostCSSWatchFiles, importPostcssConfigFile, RenderOptions, renderStyle} from './style-plugin-render'
import projectRoot from '../../utils/project-root'

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

const onTempStyleResolve = async (build: PluginBuild, args: OnResolveArgs): Promise<OnResolveResult> => {
    const {path, pluginData, resolveDir} = args

    return {
        path: path,
        namespace: LOAD_TEMP_NAMESPACE,
        pluginData: {contents: pluginData, resolveDir}
    }
}

const onStyleResolve = async (build: PluginBuild, args: OnResolveArgs): Promise<OnResolveResult> => {
    const {namespace} = args

    if (args.pluginData === SKIP_RESOLVE || namespace === LOAD_STYLE_NAMESPACE || namespace === LOAD_TEMP_NAMESPACE) return

    const result = await build.resolve(args.path, {
        resolveDir: args.resolveDir,
        pluginData: SKIP_RESOLVE,
        kind: args.kind
    })
    if (result.errors.length > 0) {
        return {errors: result.errors}
    }

    const fullPath = result.path

    // Check for pre compiled JS files like file.css.js
    if (!styleFilter.test(fullPath)) return

    return {
        path: fullPath,
        namespace: LOAD_STYLE_NAMESPACE,
        watchFiles: [fullPath]
    }
}

const onTempLoad = async (args: OnLoadArgs): Promise<OnLoadResult> => {
    const {pluginData} = args

    return {
        resolveDir: pluginData.resolveDir,
        contents: pluginData.contents,
        loader: 'css'
    }
}

const onStyleLoad = (options: PluginOptions) => async (args: OnLoadArgs): Promise<OnLoadResult> => {
    // { extract: false } is for SSR since we only need the css mapping and not the actual css file
    const extract = options.extract === undefined ? true : options.extract
    const cssModulesMatch = options.cssModulesMatch || /\.module\./
    const isCSSModule = args.path.match(cssModulesMatch)
    const cssModulesOptions = options.cssModulesOptions || {}
    const renderOptions = options.renderOptions

    const makePathRelative = filePath => {
        filePath = filePath.replace(/^file:\/\//, '')
        filePath = filePath.replace(projectRoot.replace(/^\//, ''), '')
        filePath = filePath.replace(/\.?\/*/, './')
        return filePath
    }

    // Render whatever style currently on the loader .css, .sass, .styl, .less
    let {css, map} = await renderStyle(args.path, renderOptions)
    if (map) {
        map.file = makePathRelative(args.path).replace(/\.s[ca]ss/, '.rendered.css')
    }

    let watchFiles = []
    let mapping = {data: {}}
    let {plugins = [], ...processOptions} = options.postcss || {}
    let injectMapping = false
    let contents = ''

    // Match file with extension .module. => styles.module.sass
    if (isCSSModule) {
        // We have css module file so we include the postcss-modules plugin
        plugins = [handleCSSModules(mapping, cssModulesOptions), ...plugins]
        injectMapping = true
    }

    // Makes no sense to process postcss if we don't have any plugins
    if (plugins.length > 0) {
        const result = await postcss(plugins).process(css, {
            ...processOptions,
            from: args.path,
            map: {
                prev: map
            },
        })
        css = result.css
        const sourceMap = result.map?.toJSON()
        if (sourceMap) {
            sourceMap.sources = sourceMap.sources.map(makePathRelative)
            sourceMap.file = makePathRelative(sourceMap.file).replace(/\.s[ca]ss/, '.postcss.css')
            delete sourceMap.sourcesContent[1]
            delete sourceMap.sources[1]
            css += "\n"
            css += `/*# sourceMappingURL=data:application/json;base64,${new Buffer(JSON.stringify(sourceMap)).toString('base64')} */`
        }

        watchFiles = [...watchFiles, ...getPostCSSWatchFiles(result)]

        // Inject classnames mapping for css modules
        if (injectMapping) contents += `export default ${mapping.data};`
    }

    if (extract) {
        // Bundle css into inline base64url
        contents += `import ${JSON.stringify('ni:sha-256;' + createHash('sha256').update(css).digest('base64url'))};`
    }

    return {
        watchFiles,
        resolveDir: path.dirname(args.path), // Keep resolveDir for onTempLoad anything resolve inside temp file must be resolve using source dir
        contents: contents,
        pluginData: css
    }
}

const stylePlugin = (options: PluginOptions = {}) => ({
    name: 'esbuild-style-plugin',
    setup: async (build: PluginBuild) => {
        if (options.postcssConfigFile) {
            console.log(`Using postcss config file.`)
            options.postcss = await importPostcssConfigFile(options.postcssConfigFile)
        }

        // Resolve all css or other style here
        build.onResolve({filter: styleFilter}, onStyleResolve.bind(null, build))
        build.onResolve({filter: /^ni:/, namespace: LOAD_STYLE_NAMESPACE}, onTempStyleResolve.bind(null, build))

        // New temp files from rendered css must be evaluated
        build.onLoad({filter: /.*/, namespace: LOAD_TEMP_NAMESPACE}, onTempLoad)

        // Render css with CSS Extensions / Preprocessors and PostCSS
        build.onLoad({filter: /.*/, namespace: LOAD_STYLE_NAMESPACE}, onStyleLoad(options))
    }
})

export default stylePlugin
