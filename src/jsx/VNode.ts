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
    _dom?: HTMLElement
    _renderedImmediateChildren: VNode[]
    private _listeners?: Listeners
    // __source: unknown
    // __self: unknown

    constructor(type: VNodeType, props: VNodeProps<P>, __source?, __self?) {
        this.type = type
        this.props = props
        this._children = props.children
        this._renderedImmediateChildren = []
        // this.__source = __source
        // this.__self = __self
    }

    private static _hasVNodeChildOrArray(children: any): children is VNode | ComponentChild[] {
        return (
            children
            && (
                children instanceof VNode
                || (Array.isArray(children) && children.length > 0)
            )
        )
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
