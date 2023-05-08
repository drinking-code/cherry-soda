import path from 'path'
import ora from 'ora'

export default async function (entry, options) {
    process.env.BUN_ENV = 'development'
    process.env.CHERRY_SODA_ENTRY = path.resolve(entry)
    if (options.node) {
        const child_process = await import('child_process')
        child_process.spawn('node', ['--experimental-global-customevent', '../src/server/server.node.js'], {
            cwd: path.dirname((new URL(import.meta.url)).pathname),
            env: process.env,
            stdio: 'inherit'
        })
    } else {
        global.startupSpinner = ora('Starting up...').start()
        setTimeout(() => import('../src/server/index'))
    }
}
