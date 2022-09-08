import ora from 'ora'

export async function showCompilationStatus(label, compiler, stats) {
    let isFirstCompilation = true
    let wasRunning = false, runningMessage
    const isBun = typeof Bun !== 'undefined' // todo: remove when chalk works on bun
    const chalk = !isBun && (await import('chalk')).default
    setInterval(() => {
        // started running
        if (!compiler.idle && !wasRunning) {
            // show compiling in console
            runningMessage = ora([
                isBun ? `webpack:` : chalk.blue(`webpack:`),
                'Compiling',
                label,
                (!isFirstCompilation && 'changes'),
            ].filter(v => v).join(' ')).start()
            runningMessage.color = 'cyan'
        } else // stopped running
        if (compiler.idle && wasRunning) {
            const duration = global['cherry-cola'][stats].time
            // stop showing compiling in console
            // show compiling complete in console
            runningMessage.stopAndPersist({
                text: [isBun ? `webpack:` : chalk.blue(`webpack:`),
                    'Compiled',
                    label,
                    (!isFirstCompilation && 'changes'),
                    'in',
                    isBun ? `${duration} ms` : chalk.bold(`${duration} ms`)
                ].filter(v => v).join(' '),
                symbol: isBun ? '✓' : chalk.green('✓')
            })
            runningMessage = null
            isFirstCompilation = false
        }
        wasRunning = !compiler.idle
    }, 10)
}
