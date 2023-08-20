import {type JSX} from '../index'
import {ComponentChild} from '../jsx/types/elements'
import VNode from '../jsx/VNode'
import {Fragment} from '../jsx/factory'
import {ensureArray} from '../utils/array'
import {isStateConsumer} from '../state/StateConsumer'
import {isState} from '../state/State'

let parentingNode: VNode | null = null

export function renderTo(child: ComponentChild, node: JSX.Element, dom: HTMLElement, shallow: boolean = false) {
    if (child instanceof VNode) {
        child._parent = node
        _render(child, !shallow)
    } else if (isState(child) || isStateConsumer(child)) {
        const stateConsumer = isState(child) ? child.use() : child
        dom.append(String(stateConsumer.render()))
        stateConsumer.states.forEach(state => state.tied_elements.add(node))
    } else { // string or number, or something
        dom.append(String(child))
    }
}

function _render(node: JSX.Element, rerender: boolean = true) {
    if (parentingNode && !node._parent) {
        node._parent = parentingNode
        parentingNode._renderedImmediateChildren.push(node)
    }

    const isDOM = typeof node.type === 'string'
    const isComponent = typeof node.type === 'function'
    const isFragment = node.type === Fragment

    if (isFragment || isComponent) {
        node._dom ??= node._parent._dom
    }

    if (isDOM) {
        if (rerender) {
            node._dom = document.createElement(node.type)
            Object.entries(node.props).forEach(([key, value]) => {
                if (key === 'children') return
                if (key === 'className') key = 'class'
                node._dom.setAttribute(key, value as any)
            })
        }
        node._parent._dom.append(node._dom)
        node.postRender()
    }

    if (isComponent) {
        parentingNode = node
        if (rerender) {
            node.type(node.props)
        } else {
            node._renderedImmediateChildren.forEach(child => {
                node._dom.append(child._dom)
            })
        }
        parentingNode = null
    }

    if (rerender && (isDOM || isFragment) && 'children' in node.props) {
        ensureArray<ComponentChild>(node.props.children)
            .forEach(child => renderTo(child, node, node._dom, !rerender))
    }
}

export function render(node: JSX.Element): void {
    _render(node, true)
}

export function mount(node: JSX.Element, to: HTMLElement): void {
    node._dom = to
    render(node)
}
