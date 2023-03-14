import {formatMessage, FormatMessageParametersType, userDef} from './utils'
import format from '#messages/colors'

const types = {
    UnhandledExpression: {value: 'UnhandledExpression', noUserError: true},
    ResolveError: {value: 'ResolveError'},
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
    },
    resolve: {
        noImports: {
            type: types.ResolveError,
            makeMessage: (path) =>
                `Could not resolve path "${format.userDef(path)}". "imports" in package.json is not defined.`
        }
    }
}


export function printWarning(...args: FormatMessageParametersType) {
    console.warn(formatMessage(format.warnLabel, ...args))
}
