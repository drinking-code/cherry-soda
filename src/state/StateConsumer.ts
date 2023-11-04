import type {JSX} from '../index'
import type State from './State'
import Identifiable from '../utils/Identifiable'

export type StateUsageFunctionType<V, R> = (...values: V[]) => R

export default class StateConsumer<V = any, R extends JSX.ComponentChildren = JSX.ComponentChildren> extends Identifiable {
    states: State<V> | State<V>[]
    transform: StateUsageFunctionType<V, R>

    constructor(states: State<V> | State<V>[], transform: StateUsageFunctionType<V, R>) {
        super()
        this.states = states
        this.transform = transform
    }

    render(): R {
        const values = Array.isArray(this.states)
            ? this.states.map(state => state._valueOf())
            : this.states._valueOf()
        if (this.transform) {
            return Array.isArray(values)
                ? this.transform(...values)
                : this.transform(values)
        } else {
            return values as R
        }
    }
}

export function isStateConsumer(value: any): value is StateConsumer {
    return value instanceof StateConsumer
}
