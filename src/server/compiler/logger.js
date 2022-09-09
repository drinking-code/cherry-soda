import ora from 'ora'
import {performance} from 'perf_hooks'

export function showCompilationStatus(label) {
    return {
        name: 'simple-status',
        async setup(build) {
            let start, isFirstCompilation = true, runningMessage
            const isBun = typeof Bun !== 'undefined' // todo: remove when chalk works on bun
            const chalk = !isBun && (await import('chalk')).default
            const durationDecimalPlaces = 2

            build.onStart(() => {
                start = performance.now()
                // show compiling in console
                runningMessage = ora([
                        isBun ? `webpack:` : chalk.blue(`webpack:`),
                        'Compiling',
                        label,
                        (!isFirstCompilation && 'changes'),
                    ].filter(v => v).join(' ')
                ).start()

                runningMessage.color = 'cyan'
            })
            build.onEnd(result => {
                const duration = Math.round(
                    (performance.now() - start) * 10 ** durationDecimalPlaces
                ) / (10 ** durationDecimalPlaces)
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
            })
        },
    }
}
