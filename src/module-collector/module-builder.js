import * as fs from 'fs/promises'
import * as fsSync from 'fs'
import * as path from 'path'
import appRoot from 'app-root-path'
import {SourceMapGenerator} from 'source-map'

import {possibleExtensions} from '../server/compiler/helpers/resolve-file.js'
import {default as iposPromise} from '../ipos.js'

const outputDir = appRoot.resolve(path.join('node_modules', '.cache', 'cherry-cola'))
const outputPath = path.join(outputDir, 'modules.js')
if (!fsSync.existsSync(outputPath, fs.constants.R_OK | fs.constants.W_OK)) {
    fsSync.mkdirSync(outputDir, {recursive: true})
    fs.writeFile(outputPath, '')
}
export {outputPath}

let modules = []
let addModulePromises = []
let ipos

;(async () => {
    ipos = await iposPromise
    if (!ipos.moduleImports)
        ipos.create('moduleImports', new Map())
})()


/**
 * @param {string} func
 * @param {Array<string>} parameters
 * @param {string} key
 * */
export function addModule(func, parameters, key) {
    // todo: generate a sourcemap
    modules.push([func, parameters, key])
}

/**
 * Adds imports so that assets (style sheets, images and the like) get compiled by esbuild
 * @param {string} key filename
 * @param {Object<string, Object<string, string>>} imports object with imported file as key and specifiers as value
 * */
export function addImports(key, imports) {
    Array.from(Object.keys(imports)).forEach(impFile => {
        let importedBy = []
        // console.log(ipos.moduleImports)
        if (ipos.moduleImports.has(impFile))
            importedBy = ipos.moduleImports.get(impFile)
        importedBy.push(key)
        ipos.moduleImports.set(impFile, importedBy)
    })
}

// todo: import assets (style sheets, images, etc) (perhaps an exclude-list with js extensions?)
// -> todo: handle node_module imports
export async function closeModuleBuilder() {
    const sourcemap = new SourceMapGenerator()

    const importsString = Array.from(ipos.moduleImports.keys())
        .filter(impFile => !possibleExtensions.find(extension => impFile.endsWith(extension)))
        .map(impFile => `import "${impFile}"`)
        .join("\n")

    const lengthAbove = [importsString, header]
        .map(part => part.split("\n").length)
        .reduce((a, b) => a + b)
    const modulesString = modules
        .map(([func, parameters, key]) => `modules.set('${key}', ${func})`)
        .join("\n")
    const modulesMappings = modules
        .map(([func, parameters, key], index) => {
            return (async () => {
                const fileContents = await fs.readFile(key, {encoding: 'utf8'})
                sourcemap.setSourceContent(key, fileContents)
                // todo: handle multiple "doSomething"
                const position = fileContents
                    .split("\n")
                    .map((line, index) => {
                        // get function call "doSomething(", not import
                        // todo: ignore comments; maybe already determine position in buildTree
                        return [index + 1, line.indexOf('doSomething(')]
                    })
                    .find(([line, column]) => column > 0)
                func.split("\n").forEach((a, functionLine) => {
                    sourcemap.addMapping({
                        generated: {
                            line: lengthAbove + index + 1 + functionLine,
                            column: functionLine === 0
                                ? `modules.set('${key}', `.length
                                : 0
                        },
                        source: key,
                        original: {
                            line: position[0] + functionLine,
                            column: functionLine === 0
                                ? position[1] + 'doSomething('.length
                                : 0
                        },
                    })
                })
            })()
        })

    ipos.moduleImports.clear()
    modules.slice(0, modules.length)

    const modulesJsContents = [
        importsString,
        header,
        modulesString
    ].join("\n")

    await Promise.all(modulesMappings)
    await fs.writeFile(outputPath, modulesJsContents + "\n" +
        `//# sourceMappingURL=data:application/json;base64,${(new Buffer(sourcemap.toString())).toString('base64')}`
    )
}

const header = [
    'export const modules = new Map()',
    'export const states = new Map()',
    'export const modulesStatesMap = new Map()',
].join("\n")
