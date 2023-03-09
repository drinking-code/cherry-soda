import {formatMessage, FormatMessageParametersType, MessageType, userDef} from './utils'
import format from '#messages/colors'

const types = {
    TemplateParserError: {value: 'TemplateParserError', noUserError: true}
}

export const messages = {
    templateParser: {
        invalidTemplate: {
            type: types.TemplateParserError,
            makeMessage: (template) => `Invalid template ${userDef(template)}.`
        }
    }
}

export function makeError(...args: FormatMessageParametersType) {
    const message = formatMessage(format.errorLabel, ...args)
    const [messageData]: [MessageType<any>, unknown] = args
    const error =  class extends Error {
        name = messageData.type.value
    }
    return new error(message)
}
