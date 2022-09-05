import ora from 'ora'
import chalk from 'chalk'

export function showCompilationStatus(label, compiler, stats) {
    let isFirstCompilation = true
    let wasRunning = false, runningMessage
    setInterval(() => {
        // started running
        if (!compiler.idle && !wasRunning) {
            // show compiling in console
            runningMessage = ora([
                chalk.blue(`webpack:`),
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
                text: [chalk.blue(`webpack:`),
                    'Compiled',
                    label,
                    (!isFirstCompilation && 'changes'),
                    'in',
                    chalk.bold(`${duration} ms`)
                ].filter(v => v).join(' '),
                symbol: chalk.green('✓')
            })
            runningMessage = null
            isFirstCompilation = false
        }
        wasRunning = !compiler.idle
    }, 10)
}
