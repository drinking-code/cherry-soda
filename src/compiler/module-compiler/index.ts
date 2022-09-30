import child_process from 'child_process'
import path from 'path'
import fs from 'fs/promises'
import IPOS from 'ipos'

import {default as iposPromise} from '../../ipos'
import {getImportsAsString} from './imports.js'
import {getModulesAsString} from './modules'
import appRoot from '../../utils/project-root'
import {SourceMapGenerator} from 'source-map'
import moduleRoot from '../../utils/module-root'

const ipos: IPOS = await iposPromise

const outputDir = appRoot.resolve('node_modules', '.cache', 'cherry-cola')
const serverFilePath = path.join(outputDir, 'server')
const outputPath = path.join(outputDir, 'modules.js')

export async function runModuleBuilder() {
    const collector_process = child_process.spawn('node', [
        moduleRoot.resolve('lib', 'iterate-function-components.js'),
        serverFilePath,
    ], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    })
    collector_process.on('exit', async () => {
        await new Promise(res => setTimeout(res))
        const sourcemap = new SourceMapGenerator()

        const header = [
            'export const modules = new Map()',
            'export const states = new Map()',
            'export const modulesStatesMap = new Map()',
        ].join("\n")
        const importsString = getImportsAsString()
        const modulesLinesOffset = [importsString, header]
            .map(part => part.split("\n").length)
            .reduce((a, b) => a + b)
        const modulesString = await getModulesAsString(sourcemap, modulesLinesOffset)
        const modulesJsContents = [
            importsString,
            header,
            modulesString
        ].join("\n")

        await fs.writeFile(outputPath, modulesJsContents + "\n" +
            `//# sourceMappingURL=data:application/json;base64,${(new Buffer(sourcemap.toString())).toString('base64')}`
        )
    })
    await ipos.addProcess(collector_process)
}

export {default as outputPath} from './path.js'
export {addImports} from './imports.js'
export {addModule} from './modules'
