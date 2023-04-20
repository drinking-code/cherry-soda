import path from 'path'
import fs from 'fs'

import sass, {type CompileResult, type Options as SassOptions} from 'sass'
import {type RenderOptions as StylusOptions} from 'stylus'
import {type AcceptedPlugin, type Result} from 'postcss'
import sourceMap, {type RawSourceMap} from 'source-map-js'

export interface RenderOptions {
    sassOptions?: SassOptions<'sync'>
    stylusOptions?: StylusOptions
    // @ts-ignore
    lessOptions?: Less.Options
}

export const getModule = async (moduleName: string) => {
    try {
        if (moduleName === 'sass') return sass
        return (await import(moduleName)).default
    } catch {
        throw new Error(`Missing module. Please install '${moduleName}' package.`)
    }
}

const renderStylus = (css: string, options: StylusOptions): Promise<string> => {
    return getModule('stylus')
        .then((stylus: { render: Function }) => {
            return new Promise((resolve, reject) => {
                stylus.render(css, options, (err, css) => {
                    if (err) reject(err)
                    resolve(css)
                })
            })
        })
}

export function renderStyle(filePath, options: RenderOptions = {}): { css: string, map?: RawSourceMap } | Promise<{
    css: string,
    map?: RawSourceMap
}> {
    const {ext} = path.parse(filePath)

    if (ext === '.css') {
        const contents = fs.readFileSync(filePath, 'utf8')
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
    } else if (ext === '.sass' || ext === '.scss') {
        const sassOptions = options.sassOptions || {}
        return getModule('sass')
            .then((sass: { compile: Function }) => {
                const result: CompileResult = sass.compile(filePath, sassOptions)
                return {
                    css: result?.css ?? '',
                    map: result?.sourceMap,
                }
            })
            .catch(e => {
                console.error(e)
                return {css: ''}
            })
    } else if (ext === '.styl') {
        const stylusOptions = options.stylusOptions || {}
        stylusOptions.filename = filePath
        const source = fs.readFileSync(filePath, 'utf8')
        return renderStylus(source, stylusOptions)
            .then(css => ({css}))
    } else if (ext === '.less') {
        const lestOptions = options.lessOptions || {}
        lestOptions.filename = filePath
        const source = fs.readFileSync(filePath, 'utf8')
        return getModule('less')
            .then((less: {render: Function}) => less.render(source, lestOptions))
            .then(result => ({css: result.css}))
    }

    throw new Error(`Can't render this style '${ext}'.`)
}

export const importPostcssConfigFile = async (configFilePath: string | boolean): Promise<{
    plugins: AcceptedPlugin[]
}> => {
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

export const addPostCSSWatchFiles = (fileArray: string[], result: Result) => {
    const {messages} = result
    for (const message of messages) {
        if (message.type === 'dependency') {
            fileArray.push(message.file)
        } else if (message.type === 'dir-dependency') {
            if (!message.dir) continue
            addFilesRecursive(fileArray, message.dir)
        }
    }
    return fileArray
}

function addFilesRecursive(fileArray: string[], dir: string) {
    const files = fs.readdirSync(dir)
    for (const file of files) {
        const fullFilePath = path.join(dir, file)
        const stat = fs.statSync(fullFilePath)
        if (stat.isFile())
            fileArray.push(fullFilePath)
        else if (stat.isDirectory())
            addFilesRecursive(fileArray, fullFilePath)
    }
}
