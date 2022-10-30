import child_process from 'child_process'
import path from 'path'
import IPOS from 'ipos'

import {default as iposPromise} from '../../ipos'
import appRoot from '../../utils/project-root'
import moduleRoot from '../../utils/module-root'

const ipos: IPOS = await iposPromise

const outputDir = appRoot.resolve('node_modules', '.cache', 'cherry-cola')
const serverFilePath = path.join(outputDir, 'server')

export async function runModuleBuilder() {
    const collector_process = child_process.spawn('node', [
        '--experimental-global-customevent',
        moduleRoot.resolve('lib', 'module-compiler.js'), // todo: bun
        serverFilePath,
    ], {
        env: {
            ...process.env,
        },
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
        // stdio: ['ignore', 'ignore', 'ignore', 'ipc']
    })
    let resolveFinishPromise
    const finishPromise = new Promise<void>(resolve => resolveFinishPromise = resolve)
    collector_process.on('exit', async () => {
        resolveFinishPromise()
    })
    await ipos.addProcess(collector_process)
    await finishPromise
}

export {default as outputPath} from './path.js'
export {addImports} from './imports'
export {addModule} from './modules'
