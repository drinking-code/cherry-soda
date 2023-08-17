import {JSX} from '../index'
import {ComponentChild} from '../jsx/types/elements'
import VNode from '../jsx/vNode'
import {Fragment} from '../jsx/factory'
import {ensureArray} from '../utils/array'

let parentingNode: VNode | null = null

export function render(node: JSX.Element): void {
    if (parentingNode && !node._parent) {
        node._parent = parentingNode
        node._parentDom = node._parent._dom
    }

    if (typeof node.type === 'string') {
        node._dom = document.createElement(node.type)
        Object.entries(node.props).forEach(([key, value]) => {
            if (key === 'children') return
            if (key === 'className') key = 'class'
            node._dom.setAttribute(key, value as any)
        })
        if ('children' in node.props) {
            ;(ensureArray(node.props.children) as ComponentChild[]).forEach(child => {
                if (child instanceof VNode) {
                    child._parent = node
                    child._parentDom = node._dom
                    render(child)
                } else {
                    node._dom.append(String(child))
                }
            })
        }

        node._parentDom.append(node._dom)
    } else if (node.type === Fragment) {
        node._parentDom = node._parent._parentDom
        if ('children' in node.props) {
            ;(ensureArray(node.props.children) as ComponentChild[]).forEach(child => {
                if (child instanceof VNode) {
                    child._parent = node
                    child._parentDom = node._parentDom
                    render(child)
                } else {
                    node._parentDom.append(String(child))
                }
            })
        }
    } else {
        parentingNode = node
        node.type(node.props)
        parentingNode = null
    }
}

export function mount(node: JSX.Element, to: HTMLElement): void {
    node._parentDom = to
    render(node)
}
