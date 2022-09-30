import child_process from 'child_process'
import path from 'path'
import IPOS from 'ipos'

import {getImportsAsString} from './imports.js'
import {modules} from './modules'
import appRoot from '../../utils/project-root'
import {default as iposPromise} from '../../ipos'

const ipos: IPOS = await iposPromise

// getImportsAsString
const dirname = path.dirname((new URL(import.meta.url)).pathname)
const serverFilePath = appRoot.resolve('node_modules', '.cache', 'cherry-cola', 'server')

export async function runModuleBuilder() {
    const collector_process = child_process.spawn('node', [
        path.join(dirname, '..', 'lib', 'iterate-function-components.js'),
        serverFilePath,
    ], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    })
    collector_process.on('exit', () => {
        console.log(ipos.moduleImports)
    })
    await ipos.addProcess(collector_process)
}

export {default as outputPath} from './path.js'
export {addImports} from './imports.js'
export {addModule} from './modules'
