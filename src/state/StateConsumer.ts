import type {JSX} from '../index'
import type State from './State'
import Identifiable from '../utils/Identifiable'

export type StateUsageFunctionType<V> = (...values: V[]) => JSX.ComponentChildren

export default class StateConsumer<V = any> extends Identifiable {
    states: State<V> | State<V>[]
    transform: StateUsageFunctionType<V>

    constructor(states: State<V> | State<V>[], transform: StateUsageFunctionType<V>) {
        super()
        this.states = states
        this.transform = transform
    }

    render(): JSX.ComponentChildren {
        const values = Array.isArray(this.states)
            ? this.states.map(state => state._valueOf())
            : this.states._valueOf()
        if (this.transform) {
            return Array.isArray(values)
                ? this.transform(...values)
                : this.transform(values)
        } else {
            return values as JSX.ComponentChildren
        }
    }
}

export function isStateConsumer(value: any): value is StateConsumer {
    return value instanceof StateConsumer
}
