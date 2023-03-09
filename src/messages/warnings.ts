import {formatMessage, FormatMessageParametersType, userDef} from './utils'
import format from '#messages/colors'

const types = {
    UnhandledExpression: {value: 'UnhandledExpression', noUserError: true}
}

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


export function printWarning(...args: FormatMessageParametersType) {
    console.warn(formatMessage(format.warnLabel, ...args))
}
