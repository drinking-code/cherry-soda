import {ElementChild} from "./factory";
import {VirtualElement} from "./VirtualElement";

export type VirtualElementMatcher = VirtualElement

export class ElementChildren<T = ElementChild> extends Array {
    constructor(children: ElementChild | ElementChild[]) {
        super()
        if (Array.isArray(children)) {
            for (let i = 0; i < children.length; i++) {
                this[i] = children[i]
            }
        } else
            this[0] = children
    }

    find(
        predicate: ((value: T, index: number, obj: T[]) => unknown) | VirtualElementMatcher,
        thisArg?: any
    ): T | undefined;
    find<S extends T>(
        predicate: ((this: void, value: T, index: number, obj: T[]) => value is S) | VirtualElementMatcher,
        thisArg?: any
    ): S | undefined {
        if (typeof predicate === 'function')
            return super.find(predicate, thisArg)
        else
            return super.find(value => {
                return value?.type === predicate?.type &&
                    !Array.from(Object.keys(value.props))
                        .map(key =>
                            Array.from(Object.keys(predicate.props)).includes(key)
                        )
                        .includes(false)
            }, thisArg)
    }
}
