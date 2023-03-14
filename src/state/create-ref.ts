import {VirtualElement} from '../jsx/VirtualElement'
import State from './state'
import {isArray} from '../utils/array'

export default function createRef<T extends RefConstraint = RefConstraint>() {
    return new Ref<T>()
}

type HTMLOrVirtualElement = VirtualElement | HTMLElement
type RefConstraint = HTMLElement | HTMLElement[] | unknown

export class Ref<P extends RefConstraint = RefConstraint> extends State<RefConstraint> {
    declare _value: RefConstraint

    constructor() {
        super()
    }

    populate(element: RefConstraint) {
        if (!super._value) {
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
}

export function isRef(value): value is Ref {
    return value?.constructor?.name === 'Ref'
}
