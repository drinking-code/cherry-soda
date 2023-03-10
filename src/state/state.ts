import {StateId} from './state-id'
import StateUsage from './state-usage'
import {StringifiableType} from '../utils/stringify'

export default class State<V = any> {
    $$stateId: StateId
    private readonly _value: V

    constructor(initialValue?: any) {
        this._value = initialValue
        this.$$stateId = new StateId()
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

export function isState(value: any): value is State {
    return value instanceof State
}
