import {TextDecoder} from 'util'
import path from 'path'
import fs from 'fs'
import glob from 'glob'
import {CompileResult, Options as SassOptions} from 'sass'
import {RenderOptions as StylusOptions} from 'stylus'
import {AcceptedPlugin, Result} from 'postcss'
import sass from 'sass'
import sourceMap, {RawSourceMap} from 'source-map-js'

export interface RenderOptions {
    sassOptions?: SassOptions<'sync'>
    stylusOptions?: StylusOptions
    // @ts-ignore
    lessOptions?: Less.Options
}

export const getModule = async (moduleName: string) => {
    try {
        if (moduleName === 'sass') {
            return sass
        }
        return (await import(moduleName)).default
    } catch {
        throw new Error(`Missing module. Please install '${moduleName}' package.`)
    }
}

const renderStylus = async (css: string, options: StylusOptions): Promise<string> => {
    const stylus = await getModule('stylus')
    return new Promise((resolve, reject) => {
        stylus.render(css, options, (err, css) => {
            if (err) reject(err)
            resolve(css)
        })
    })
}

export const renderStyle = async (filePath, options: RenderOptions = {}): Promise<{ css: string, map?: RawSourceMap }> => {
    const {ext} = path.parse(filePath)

    if (ext === '.css') {
        const contents = (await fs.promises.readFile(filePath)).toString()
        const sourceMapGenerator = new sourceMap.SourceMapGenerator({file: filePath})
        sourceMapGenerator.addMapping({
            source: filePath,
            original: {line: 1, column: 0},
            generated: {line: 1, column: 0}
        })
        sourceMapGenerator.setSourceContent(filePath, contents)
        return {
            css: contents,
            map: JSON.parse(sourceMapGenerator.toString())
        }
    }

    if (ext === '.sass' || ext === '.scss') {
        const sassOptions = options.sassOptions || {}
        const sass = await getModule('sass')
        let result: CompileResult
        try {
            result = sass.compile(filePath, {...sassOptions})
        } catch (e) {
            console.log(e)
        }
        return {
            css: result?.css ?? '',
            map: result?.sourceMap,
        }
    }

    if (ext === '.styl') {
        const stylusOptions = options.stylusOptions || {}
        const source = await fs.promises.readFile(filePath)
        return {
            css: await renderStylus(new TextDecoder().decode(source), {...stylusOptions, filename: filePath})
        }
    }

    if (ext === '.less') {
        const lestOptions = options.lessOptions || {}
        const source = await fs.promises.readFile(filePath)
        const less = await getModule('less')
        return {
            css: (await less.render(new TextDecoder().decode(source), {...lestOptions, filename: filePath})).css
        }
    }

    throw new Error(`Can't render this style '${ext}'.`)
}

export const importPostcssConfigFile = async (configFilePath: string | boolean): Promise<{ plugins: AcceptedPlugin[] }> => {
    let _configFilePath = configFilePath === true ? path.resolve(process.cwd(), 'postcss.config.js') : configFilePath as string

    try {
        const imported = await import(_configFilePath)
        if (!imported.default) throw new Error(`Missing default import .`)
        const config = imported.default
        if (!config.plugins) throw new Error(`Missing plugins [array].`)
        return config
    } catch (err) {
        console.error(err)
        throw new Error(`PostCSS config file at ${_configFilePath} can't load.`)
    }
}

export const getPostCSSWatchFiles = (result: Result) => {
    let watchFiles = [] as string[]
    const {messages} = result
    for (const message of messages) {
        const {type} = message
        if (type === 'dependency') {
            watchFiles.push(message.file)
        } else if (type === 'dir-dependency') {
            if (!message.dir) continue

            // Can be translated to const globString = message.glob ?? `**/*` but we will use code bellow to support node12
            // https://node.green/#ES2020-features--nullish-coalescing-operator-----
            let globString = `**/*`
            if (message.glob && message.glob !== '') globString = message.glob

            const globPath = path.join(message.dir, globString)
            const files = glob.globSync(globPath)
            watchFiles = [...watchFiles, ...files]
        }
    }
    return watchFiles
}
