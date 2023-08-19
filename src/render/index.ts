import {JSX} from '../index'
import {ComponentChild} from '../jsx/types/elements'
import VNode from '../jsx/VNode'
import {Fragment} from '../jsx/factory'
import {ensureArray} from '../utils/array'

let parentingNode: VNode | null = null

function renderTo(child: ComponentChild, node: JSX.Element, dom: HTMLElement) {
    if (child instanceof VNode) {
        child._parent = node
        child._parentDom = dom
        render(child)
    } else {
        dom.append(String(child))
    }
}

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
        node._parentDom.append(node._dom)
        node.postRender()
        if ('children' in node.props) {
            ensureArray<ComponentChild>(node.props.children)
                .forEach(child => renderTo(child, node, node._dom))
        }
    } else if (node.type === Fragment) {
        node._parentDom = node._parent._parentDom
        if ('children' in node.props) {
            ensureArray<ComponentChild>(node.props.children)
                .forEach(child => renderTo(child, node, node._parentDom))
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
