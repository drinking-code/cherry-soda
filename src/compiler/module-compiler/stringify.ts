import isState from '../../state/is-state'
import {isRef} from '../../jsx/create-ref'

export function stringify(value) {
    if (value === undefined) return 'undefined'
    else if (value === null) return 'null'
    else if (typeof value === 'boolean') return value.toString()
    // todo: serialize complex parameters (such as imports) -> imports with "currentFile"
    else if (isState(value)) {
        return `createClientState(${stringify(value.value)}, '${value.$$stateId.serialize()}')`
    } else if (isRef(value)) {
        return `findElement(${value.stringify()})`
    } else if (Array.isArray(value) || value.constructor === {}.constructor) {
        // todo recursively serialise values
        return JSON.stringify(value)
    } else if (typeof value === 'string')
        return `"${value.toString()}"`
    else if (['number', 'function'].includes(typeof value) || value.toString)
        return value.toString()
    // todo
}
