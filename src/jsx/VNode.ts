import {JSX} from '../index'
import {Fragment} from './factory'
import {ComponentChild} from './types/elements'
import Listeners from './Listeners'
import {ensureArray} from '../utils/array'

type VNodeType = JSX.FunctionComponent | typeof Fragment | keyof JSX.IntrinsicElements
type VNodeProps<P> = P & {children: JSX.ComponentChildren}

export default class VNode<P = {}> {
    readonly type: VNodeType
    readonly props: VNodeProps<P>
    readonly _children: JSX.ComponentChildren
    _parent: VNode
    _dom?: HTMLElement | DocumentFragment
    _fragmentChildren?: (HTMLElement | Text)[]
    private _listeners?: Listeners

    get _actualDom() {
        let nodeWithActualDom: VNode = this
        while (!(nodeWithActualDom._dom instanceof HTMLElement))
            nodeWithActualDom = nodeWithActualDom._parent
        return nodeWithActualDom._dom
    }

    constructor(type: VNodeType, props: VNodeProps<P>) {
        this.type = type
        this.props = props
        this._children = props.children
    }

    postRender() {
        this._listeners?.activateQueued()
    }

    get on() {
        if (!this._listeners) {
            this._listeners = new Listeners(this)
        }
        return this._listeners.getActivators()
    }
}

export function isEqualVNode(target: VNode, test: VNode): boolean {
    if (typeof test.type === 'function') {
        return test.type === target.type
    } else if (test.type === Fragment) {
        const testChildren = ensureArray(test._children)
        const targetChildren = ensureArray(target._children)
        return testChildren.length === targetChildren.length &&
            testChildren.every((testChild, index) => {
                if (testChild instanceof VNode) {
                    return targetChildren[index] instanceof VNode &&
                        isEqualVNode(targetChildren[index] as VNode, testChild)
                } else {
                    return testChild === targetChildren[index]
                }
            })
    } else if (typeof test.type === 'string') {
        if (test.type !== target.type) return false
        for (const testPropsKey in test.props) {
            if (!(testPropsKey in target.props)) return false
            if (test.props[testPropsKey] !== target.props[testPropsKey]) return false
        }
        return true
    }
}

export function yieldsDomNodes(node: ComponentChild) {
    if (node instanceof VNode) {
        if (node.type === Fragment) {
            if (Array.isArray(node._children)) return node._children.some(yieldsDomNodes)
            else return yieldsDomNodes(node._children)
        } else if (typeof node.type === 'function') {
            // todo
            return null
        } else return true
    } else return true
}
