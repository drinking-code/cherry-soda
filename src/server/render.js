import child_process from 'child_process'
import path from 'path'
import ipos from '../ipos.js'

let rendering_process

export default function render() {
    let resolve
    const promise = new Promise(res => resolve = res)

    rendering_process.on('message', message => {
        if (message.type === 'response')
            resolve(message.content)
    })

    rendering_process.send({
        type: 'instruction',
        do: 'render',
    })

    return promise
}

export async function restartRenderer(serverFilePath) {
    const dirname = path.dirname((new URL(import.meta.url)).pathname)
    rendering_process?.kill('SIGABRT')
    rendering_process = child_process.spawn('node', [
        path.join(dirname, 'renderer.js'),
        serverFilePath,
    ], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    })
    await ipos.addProcess(rendering_process)
}
