import child_process from 'child_process'
import path from 'path'
import ipos from '../ipos.js'

let rendering_process, serverFilePath, compilerFinishEventTarget
if (typeof Bun === 'undefined') {
    const nodeCompiler = await import('./compiler/node.js')
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
    rendering_process.once('message', message => {
        try {
            message = JSON.parse(message)
        } catch (e) {
            // fail silently
        }
        if (message.type === 'response')
            renderedContent = message.content
    })

    for (const key in global['cherry-cola']) {
        if (!global['cherry-cola'].hasOwnProperty(key)) continue
        rendering_process.send(JSON.stringify({
            type: 'variable',
            key,
            value: global['cherry-cola'][key]
        }))
    }
    rendering_process.send(JSON.stringify({
        type: 'instruction',
        do: 'render',
    }))
}

export function startWatching() {
    if (typeof Bun === 'undefined') {
        compilerFinishEventTarget.addEventListener('renderend', restartProgram)
    } else {
        // todo
    }
}
