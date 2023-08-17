import {JSX} from '../index'
import {type Fragment} from './factory'

type VNodeType = JSX.FunctionComponent | typeof Fragment | keyof JSX.IntrinsicElements
type VNodeProps<P> = P & {children: JSX.ComponentChildren}

export default class VNode<P = {}> {
    readonly type: VNodeType
    readonly props: VNodeProps<P>
    readonly ref?: string
    _vNodeId?: string
    _children: JSX.ComponentChildren
    _parent: VNode
    _depth: number
    _dom?: HTMLElement
    _parentDom?: HTMLElement
    // _nextDom: undefined
    // _component: null
    // _hydrating: null
    // constructor: undefined
    // _original: --vNodeId
    __source: unknown
    __self: unknown

    constructor(type: VNodeType, props: VNodeProps<P>, __source?, __self?) {
        this.type = type
        this.props = props
        this.__source = __source
        this.__self = __self
    }
}
