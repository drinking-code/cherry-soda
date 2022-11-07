import isState from '../../state/is-state'
import {isRef} from '../../jsx/create-ref'

export function stringify(value: any): string {
    if (value === undefined)
        return 'undefined'
    if (value === null)
        return 'null'

    // todo: serialize complex parameters (such as imports) -> imports with "currentFile"
    if (isState(value)) {
        return `createClientState(${stringify(value.value)}, '${value.$$stateId.serialize()}')`
    }
    if (isRef(value)) {
        return `findElement(${value.stringify()})`
    }
    if (typesHoldingData.includes(value.constructor)) {
        if (Map === value.constructor) {
            return `new Map(${stringify(Array.from(value.entries()))})`
        }
        if (Set === value.constructor) {
            return `new Set(${stringify(Array.from(value.values()))})`
        }
        return `new ${value.constructor.name}()`
    }
    if (Array.isArray(value) || value.constructor === {}.constructor) {
        // todo recursively serialise values
        return JSON.stringify(value)
    }
    if (typeof value === 'string')
        return `"${value.toString()}"`

    if (['number', 'function', 'boolean'].includes(typeof value) || value.toString) {
        return value.toString()
    }
    // todo
}

// types that hold data
// types that do not hold data
// types from which instances cannot be created

const typesHoldingData = [
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
    // todo: Object?, Function?, Boolean?, Symbol?
    // todo: Errors
    // todo: Number?, BigInt?, Date
    // todo: String?, RegExp
    // todo: Typed Arrays
    Map, Set //,WeakMap, WeakSet
    // todo: Structured data
    // todo: Control abstraction objects?
]
