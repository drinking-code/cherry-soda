import {StateId} from './state-id'

export default function createState<T>(initialValue: T): State<T> {
    const extendedClass = extendConstructor(initialValue.constructor)
    return new extendedClass(initialValue)
}

export type StateType = GenericState | State<unknown>

export interface State<T> {
    $$stateId: StateId,
    value: T,
}

export class GenericState {
    $$stateId: StateId

    constructor(id: StateId) {
        this.$$stateId = id
    }

    get value(): null {
        return null
    }
}

const constructorsWithoutNew = [Boolean, String, Number]
const ignoreConstructors = [Array, Map, Set, Function]

function extendConstructor(constructor) {
    const needsNew = !constructorsWithoutNew.includes(constructor)
    const ignoreConstructor = ignoreConstructors.includes(constructor)
    return class State<T> extends constructor {
        $$stateId: StateId
        private _value: T

        constructor(value: T) {
            super(value)
            this._value = value
            this.$$stateId = new StateId()
        }

        get value(): T {
            return this.valueOf()
        }

        valueOf(): T {
            if (ignoreConstructor)
                return this._value
            if (needsNew)
                return new constructor(this._value)
            return constructor(this._value)
        }
    }
}
