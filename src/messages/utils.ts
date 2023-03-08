import {formatCcDef, formatNote, formatUserDef} from '#messages/colors'

export const noUserError = formatNote('(This is an error with cherry-cola. Report under https://github.com/drinking-code/cherry-cola/issues/new)')
export const wrapWithBackticks = v => `\`${v}\``
export const userDef = v => wrapWithBackticks(formatUserDef(v))
export const ccDef = v => wrapWithBackticks(formatCcDef(v))

export type MessageType<A> = {
    type: { value: string, noUserError?: boolean },
    makeMessage: (...args: A[]) => string
}

export function formatMessage<A>(
    formatLabel: Function,
    messageData: MessageType<A>,
    args: A[],
) {
    let message = ''
    const typeLabel = ` ${messageData.type.value.trim()} `
    message += formatLabel(typeLabel)
    message += ' '
    message += messageData.makeMessage(...args)
    if (messageData.type.noUserError) {
        message += "\n"
        message += Array(typeLabel.length + 1).fill(' ').join('')
        message += noUserError
    }
    return message
}

type ParametersExceptFirst<F> = F extends (arg0: any, ...rest: infer R) => any ? R : never;
export type FormatMessageParametersType = ParametersExceptFirst<typeof formatMessage>
