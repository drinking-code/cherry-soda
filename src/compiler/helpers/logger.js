import console from '../../utils/console.js'
import {performance} from 'perf_hooks'
import chalk from 'chalk'

export function showCompilationStatus(label) {
    return {
        name: 'simple-status',
        async setup(build) {
            if (process.env.NODE_ENV === 'test') return
            let start, isFirstCompilation = true, runningMessage
            const durationDecimalPlaces = 2
            const compilerName = 'Compiler'

            build.onStart(() => {
                start = performance.now()
                // show compiling in console
                runningMessage = console.spinner([
                        chalk.blue(`${compilerName}:`),
                        'Compiling',
                        label,
                        (!isFirstCompilation && 'changes'),
                    ].filter(v => v).join(' ')
                ).start()

                runningMessage.color = 'cyan'
            })
            build.onEnd(() => {
                const duration = Math.round(
                    (performance.now() - start) * 10 ** durationDecimalPlaces
                ) / (10 ** durationDecimalPlaces)
                // show compiling complete in console
                runningMessage.stopAndPersist({
                    text: [
                        chalk.blue(`${compilerName}:`),
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
            })
        },
    }
}
