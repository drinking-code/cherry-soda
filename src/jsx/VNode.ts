import {JSX} from '../index'
import {type Fragment} from './factory'
import {ComponentChild} from './types/elements'
import Listeners from './Listeners'

type VNodeType = JSX.FunctionComponent | typeof Fragment | keyof JSX.IntrinsicElements
type VNodeProps<P> = P & {children: JSX.ComponentChildren}

export default class VNode<P = {}> {
    readonly type: VNodeType
    readonly props: VNodeProps<P>
    readonly ref?: string
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

    private static _hasVNodeChildOrArray(children): children is VNode | ComponentChild[] {
        return (
            children
            && (
                children instanceof VNode
                || (Array.isArray(children) && children.length > 0)
            )
        )
    }

    private static _childMatchesRef(child: ComponentChild, ref: string) {
        return child instanceof VNode
            && 'ref' in child.props
            && child.props.ref === ref
    }

    getByRef(ref: string): VNode {
        if (!VNode._hasVNodeChildOrArray(this._children)) return undefined
        if (VNode._childMatchesRef(this._children, ref)) {
            return this._children as VNode
        } else {
            for (const child of this._children as ComponentChild[]) {
                if (VNode._childMatchesRef(child, ref)) {
                    return child as VNode
                }
            }
        }
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
