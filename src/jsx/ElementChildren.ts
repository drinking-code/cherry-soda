import {VirtualElement} from './VirtualElement'

export type VirtualElementMatcher = VirtualElement | JSX.Element

export type ElementChild =
    | VirtualElement
    | object
    | string
    | number
    | bigint
    | boolean
    | null
    | undefined

export class ElementChildren<T = ElementChild> extends Array {
    constructor(children: ElementChild | ElementChild[]) {
        super()
        if (Array.isArray(children)) {
            for (let i = 0; i < children.length; i++) {
                this[i] = children[i]
            }
        } else if (![null, undefined].includes(children))
            this[0] = children
    }

    find(
        predicate: ((value: T, index: number, obj: T[]) => unknown) | VirtualElementMatcher,
        thisArg?: any
    ): T | undefined
    find<S extends T>(
        predicate: ((this: void, value: T, index: number, obj: T[]) => value is S) | VirtualElementMatcher,
        thisArg?: any
    ): S | undefined {
        if (typeof predicate === 'function')
            return super.find(predicate, thisArg)
        else
            return super.find(value => {
                if (!(predicate instanceof VirtualElement)) return false
                return value?.type === predicate?.type &&
                    !Array.from(Object.keys(value.props))
                        .map(key =>
                            Array.from(Object.keys(predicate.props)).includes(key)
                        )
                        .includes(false)
            }, thisArg)
    }

    filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[] {
        return new ElementChildren(Array.from(this).filter(predicate, thisArg))
    }

    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
        return new ElementChildren(Array.from(this).map(callbackfn, thisArg))
    }
}
