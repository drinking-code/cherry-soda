import type {JSX} from '../index'
import type VNode from '../jsx/VNode'
import Identifiable from '../utils/Identifiable'
import StateConsumer, {StateUsageFunctionType} from './StateConsumer'
import {updateNodeChild, updateNodeProp} from '../render/update'

export type TiedNodeChildrenData = {
    parent: VNode,
    domNodes: (HTMLElement | Text)[],
    consumer: StateConsumer,
}

export type TiedNodePropData = {
    node: VNode,
    prop: string,
    consumer: StateConsumer,
}

type TiedNodeData = TiedNodePropData | TiedNodeChildrenData

export default class State<V = any> extends Identifiable {
    protected _value: V
    _tiedNodes?: TiedNodeData[]

    constructor(initialValue: V) {
        super()
        this._value = initialValue
    }

    valueOf(): V {
        return this._value
    }

    _ensureTiedNodes() {
        this._tiedNodes ??= []
    }

    _hasNodeTied(data: TiedNodeData): boolean {
        return this._tiedNodes.some(tiedNode => {
            const bothHaveNode = 'node' in data && 'node' in tiedNode
            const bothHaveParent = 'parent' in data && 'parent' in tiedNode
            const equalNode =
                bothHaveNode
                    ? data.node === tiedNode.node
                    : bothHaveParent
                        ? data.parent === tiedNode.parent
                        : false
            const bothHaveChildIndex = 'childIndex' in data && 'childIndex' in tiedNode
            const equalChildIndex = bothHaveChildIndex && data.childIndex === tiedNode.childIndex
            const bothHaveProp = 'prop' in data && 'prop' in tiedNode
            const equalProp = bothHaveProp && data.prop === tiedNode.prop
            return equalNode && (equalChildIndex || equalProp)
        })
    }

    _tieNodeChild(parent: VNode, consumer: StateConsumer, domNodes?: (HTMLElement | Text)[]) {
        this._ensureTiedNodes()
        const data: TiedNodeData = {parent, domNodes, consumer}
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
        for (const index in this._tiedNodes) {
            const tiedNodeData = this._tiedNodes[index]
            if ('domNodes' in tiedNodeData) {
                updateNodeChild(tiedNodeData)
            } else if ('prop' in tiedNodeData) {
                updateNodeProp(tiedNodeData)
            }
        }
    }

    use<R extends JSX.ComponentChildren>(transform?: (value: V) => R): StateConsumer<V, R> {
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

    use<R extends JSX.ComponentChildren>(transform?: StateUsageFunctionType<V, R>): StateConsumer<V, R> {
        return new StateConsumer(this.states, transform)
    }

    and(state: State): StateConcatenation<V> {
        return new StateConcatenation(...this.states, state)
    }
}

export function isState(value: any): value is State | StateConcatenation {
    return value instanceof State || value instanceof StateConcatenation
}
