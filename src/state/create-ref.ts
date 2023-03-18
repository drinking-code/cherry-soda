import {VirtualElement} from '../jsx/VirtualElement'
import {isArray} from '../utils/array'
import AbstractState from './abstract-state'

export default function createRef<T extends RefConstraint = RefConstraint>() {
    return new Ref<T>()
}

type RefConstraint = HTMLElement | unknown

export class Ref<P extends RefConstraint = RefConstraint> extends AbstractState {
    declare _value: P | P[]

    constructor() {
        super()
    }

    populate(element: P) {
        if (!this._value) {
            this._value = element
        } else {
            if (!isArray(this._value)) {
                const currentElement = this._value
                this._value = [currentElement, element]
            } else {
                this._value.push(element)
            }
        }
    }

    getIds() {
        const value = Array.isArray(this._value) ? this._value : [this._value]
        return value.map(element => (element as VirtualElement).id).filter(v => v)
    }
}

export function isRef(value): value is Ref {
    return value instanceof Ref
}
