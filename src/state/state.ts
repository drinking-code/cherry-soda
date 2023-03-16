import StateUsage from './state-usage'
import {StringifiableType} from '../utils/stringify'
import AbstractState from './abstract-state'

export default class State<V = any> extends AbstractState {
    protected _value: V

    constructor(initialValue?: V) {
        super()
        this._value = initialValue
    }

    /**
     * @internal Use {@link use|`.use()`} instead
     */
    valueOf(): V {
        return this._value
    }

    use<U extends StringifiableType = StringifiableType>(transform?: (value: V) => U) {
        return new StateUsage(this, transform)
    }

    and(state: State) {
        return (new StateConcatenation(this)).and(state)
    }
}

export class StateConcatenation<V = any> {
    states: State<V>[] = []

    constructor(state: State) {
        this.and(state)
    }

    use<U extends StringifiableType = StringifiableType>(transform?: (...values: V[]) => U) {
        return new StateUsage(this.states, transform)
    }

    and(state: State) {
        this.states.push(state)
    }
}

export function createState<T = any>(initialValue: T): State<T> {
    return new State<T>(initialValue)
}

export function isState(value: any): value is State | StateConcatenation {
    return (value instanceof State && value?.constructor?.name === State.name) || value instanceof StateConcatenation
}