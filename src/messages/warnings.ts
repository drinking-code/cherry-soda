import chalk from 'chalk'

const noUserError = chalk.italic('(This is an error with cherry-cola. Report under https://github.com/drinking-code/cherry-cola/issues/new)')

const types = {
    UnhandledExpression: {value: 'UnhandledExpression', noUserError: true}
}

const wrapWithBackticks = v => `\`${v}\``
const userDef = v => wrapWithBackticks(chalk.bold(v))
const ccDef = v => wrapWithBackticks(chalk.italic(v))

export const messages = {
    compiler: {
        backtrackCalleeToImport: {
            couldNotFindKey: {
                type: types.UnhandledExpression,
                makeMessage: (key, objectName) =>
                    `Could not find key ${userDef(key)} in ${userDef(objectName)}.`
            }
        }
    }
}

export function printWarning<A>(warning: { type: { value: string, noUserError?: boolean }, makeMessage: (...args: A[]) => string }, args: A[]) {
    let message = ''
    const typeLabel = ` ${warning.type.value.trim()} `
    message += chalk.bgYellowBright.black.bold(typeLabel)
    message += ' '
    message += warning.makeMessage(...args)
    if (warning.type.noUserError) {
        message += "\n"
        message += Array(typeLabel.length + 1).fill(' ').join('')
        message += noUserError
    }
    console.warn(message)
}
