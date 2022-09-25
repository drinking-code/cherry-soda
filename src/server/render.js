import child_process from 'child_process'
import path from 'path'
import ipos from '../ipos.js'

let rendering_process, serverFilePath, compilerFinishEventTarget
if (typeof Bun === 'undefined') {
    const nodeCompiler = await import('../compiler/node.js')
    serverFilePath = nodeCompiler.outputPath
    compilerFinishEventTarget = nodeCompiler.compilerFinishEventTarget
} else {
    // todo
}

let renderedContent

export default function render() {
    let resolve
    const promise = new Promise(res => resolve = res)

    const checkRenderedContentInterval = setInterval(() => {
        if (!renderedContent) return
        clearInterval(checkRenderedContentInterval)
        resolve(renderedContent)
    })

    return promise
}

async function restartProgram() {
    // todo: two rendering processes, one immediately after restart (module-collection) one at request time (actual render)
    renderedContent = null
    const dirname = path.dirname((new URL(import.meta.url)).pathname)
    rendering_process?.kill('SIGABRT')
    rendering_process = child_process.spawn('node', [
        path.join(dirname, 'renderer.js'),
        serverFilePath,
    ], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    })
    await ipos.addProcess(rendering_process)
    // render immediately to start off module collecting / compilation
    rendering_process.on('message', message => {
        if (message.type === 'response')
            renderedContent = message.content
    })

    rendering_process.send({
        type: 'instruction',
        do: 'render',
    })
}

export function startWatching() {
    if (typeof Bun === 'undefined') {
        // compilerFinishEventTarget.addEventListener('renderend', restartProgram)
    } else {
        // todo
    }
}
