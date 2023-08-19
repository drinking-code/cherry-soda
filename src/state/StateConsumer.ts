import type {JSX} from '../index'
import type State from './State'
import Identifiable from '../utils/Identifiable'
import {ensureArray} from '../utils/array'

export type StateUsageFunctionType<V> = (...values: V[]) => JSX.ComponentChildren

export default class StateConsumer<V = any> extends Identifiable {
    states: State<V>[]
    transform: StateUsageFunctionType<V>

    constructor(states: State<V> | State<V>[], transform: StateUsageFunctionType<V>) {
        super()
        this.states = ensureArray(states)
        this.transform = transform
    }

    render(): JSX.ComponentChildren {
        const values = this.states.map(state => state._valueOf())
        if (this.transform) {
            return this.transform(...values)
        } else {
            return values
        }
    }
}

export function isStateConsumer(value: any): value is StateConsumer {
    return value instanceof StateConsumer
}
