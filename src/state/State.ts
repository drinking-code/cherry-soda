import type {JSX} from '../index'
import type VNode from '../jsx/VNode'
import Identifiable from '../utils/Identifiable'
import StateConsumer, {StateUsageFunctionType} from './StateConsumer'
import {updateNodeChild, updateNodeProp} from '../render/update'

type TiedNodeData = {
    node: VNode,
    childIndex: number,
    consumer: StateConsumer
} | {
    node: VNode,
    prop: string,
    consumer: StateConsumer
}

export default class State<V = any> extends Identifiable {
    protected _value: V
    _tiedNodes?: TiedNodeData[]

    constructor(initialValue: V) {
        super()
        this._value = initialValue
    }

    _valueOf(): V {
        return this._value
    }

    _ensureTiedNodes() {
        this._tiedNodes ??= []
    }

    _hasNodeTied(data: TiedNodeData): boolean {
        return this._tiedNodes.some(tiedNode => {
            return data.node === tiedNode.node
                && (
                    'childIndex' in data && 'childIndex' in tiedNode && data.childIndex === tiedNode.childIndex
                    || 'prop' in data && 'prop' in tiedNode && data.prop === tiedNode.prop
                )
        })
    }

    _tieNodeChild(node: VNode, consumer: StateConsumer, childIndex?: number) {
        this._ensureTiedNodes()
        childIndex ??= node._dom.childNodes.length - 1
        const data: TiedNodeData = {node, childIndex, consumer}
        if (this._hasNodeTied(data)) return
        this._tiedNodes.push(data)
    }

    _tieNodeProp(node: VNode, consumer: StateConsumer, prop: string) {
        this._ensureTiedNodes()
        const data: TiedNodeData = {node, prop, consumer}
        if (this._hasNodeTied(data)) return
        this._tiedNodes.push(data)
    }

    update(newValue: V) {
        this._value = newValue
        this._tiedNodes?.forEach((tiedNodeData) => {
            if ('childIndex' in tiedNodeData) {
                updateNodeChild(tiedNodeData.node, tiedNodeData.childIndex, tiedNodeData.consumer)
            } else if ('prop' in tiedNodeData) {
                updateNodeProp(tiedNodeData.node, tiedNodeData.prop, tiedNodeData.consumer)
            }
        })
    }

    use(transform?: (value: V) => JSX.ComponentChildren): StateConsumer<V> {
        return new StateConsumer(this, transform)
    }

    and(state: State): StateConcatenation<V> {
        return new StateConcatenation(this, state)
    }

    toString() {
        // todo: show error
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
