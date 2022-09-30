import {default as iposPromise} from '../../ipos'
import fs from 'fs/promises'
import {SourceMapGenerator} from 'source-map'

const ipos = await iposPromise

if (!ipos.modules)
    ipos.create('modules', [])
export const modules: Array<[string, Array<any>, string]> = ipos.modules

export function addModule(func: string, parameters: Array<any>, key: string) {
    modules.push([func, parameters, key])
}

export async function getModulesAsString(sourcemap: SourceMapGenerator, linesOffset: number): Promise<string> {
    const modulesString = modules
        .map(([func, parameters, key]) => `modules.set('${key}', ${func})`)
        .join("\n")

    const modulesMappings = modules
        .map(([func, parameters, key], index) => {
            return new Promise<void>(async resolve => {
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
                            line: linesOffset + index + 1 + functionLine,
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

                resolve()
            })
        })

    modules.slice(0, modules.length)

    await Promise.all(modulesMappings)

    return modulesString
}
