import child_process from 'child_process'
import path from 'path'
import fs from 'fs'

let rendering_process
let serverFilePath
if (typeof Bun === 'undefined') {
    serverFilePath = (await import('./compiler/node.js')).outputPath
} else {
    // todo
}

export default function render() {
    let resolve
    const promise = new Promise(res => resolve = res)
    rendering_process.once('message', message => {
        try {
            message = JSON.parse(message)
        } catch (e) {
            // fail silently
        }

        if (message.type === 'response')
            resolve(message.content)
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

    return promise
}

async function restartProgram() {
    const dirname = (new URL(import.meta.url)).pathname.replace(/\/[^/]+$/, '')
    rendering_process?.kill('SIGABRT')
    rendering_process = child_process.spawn('node', [
        path.join(dirname, 'renderer.js'),
        serverFilePath,
    ], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    })
}

if (typeof Bun === 'undefined') {
    // todo: replace with esbuild plugin
    fs.watchFile(path.join(serverFilePath, 'App.js'), restartProgram)
} else {
    // todo
}

restartProgram()
