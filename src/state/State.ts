import type {JSX} from '../index'
import type VNode from '../jsx/VNode'
import Identifiable from '../utils/Identifiable'
import StateConsumer, {StateUsageFunctionType} from './StateConsumer'
import update from '../render/update'

export default class State<V = any> extends Identifiable {
    protected _value: V
    tied_elements: Set<VNode>

    constructor(initialValue: V) {
        super()
        this._value = initialValue
        this.tied_elements = new Set()
    }

    _valueOf(): V {
        return this._value
    }

    update(newValue: V) {
        this._value = newValue
        this.tied_elements.forEach(update)
    }

    use(transform?: (value: V) => JSX.ComponentChildren): StateConsumer<V> {
        return new StateConsumer(this, transform)
    }

    and(state: State): StateConcatenation<V> {
        return new StateConcatenation(this, state)
    }
}

export class StateConcatenation<V = any> {
    states: State<V>[]

    constructor(...states: State[]) {
        this.states = states
    }

    use(transform?: StateUsageFunctionType<V>): StateConsumer<V> {
        return new StateConsumer(this.states, transform)
    }

    and(state: State): StateConcatenation<V> {
        return new StateConcatenation(...this.states, state)
    }
}

export function isState(value: any): value is State | StateConcatenation {
    return value instanceof State || value instanceof StateConcatenation
}
