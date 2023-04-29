import path from 'path'

export default async function (entry, options) {
    process.env.BUN_ENV = 'development'
    process.env.CHERRY_SODA_ENTRY = entry
    if (options.node) {
        const child_process = await import('child_process')
        child_process.spawn('node', ['--experimental-global-customevent', '../src/server/server.node.js'], {
            cwd: path.dirname((new URL(import.meta.url)).pathname),
            env: process.env,
            stdio: 'inherit'
        })
    } else {
        import('../src/server/index')
    }
}
