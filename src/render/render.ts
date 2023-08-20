import {type JSX} from '../index'
import {ComponentChild} from '../jsx/types/elements'
import VNode from '../jsx/VNode'
import {Fragment} from '../jsx/factory'
import {ensureArray} from '../utils/array'
import {isStateConsumer} from '../state/StateConsumer'
import {isState} from '../state/State'

let parentingNode: VNode | null = null

export function renderTo(child: ComponentChild, node: JSX.Element, shallow: boolean = false) {
    if (child instanceof VNode) {
        child._parent = node
        _render(child, !shallow)
    } else if (isState(child) || isStateConsumer(child)) {
        const stateConsumer = isState(child) ? child.use() : child
        const result = stateConsumer.render()

        if (result instanceof VNode) {
            // todo
        } else {
            node._dom.append(String(result))
        }

        if (Array.isArray(stateConsumer.states)) {
            stateConsumer.states.forEach(state => state._tieNodeChild(node, stateConsumer))
        } else {
            stateConsumer.states._tieNodeChild(node, stateConsumer)
        }
    } else { // string or number, or something
        node._dom.append(String(child))
    }
}

export function _render(node: JSX.Element, rerender: boolean = true) {
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

                if (isState(value) || isStateConsumer(value)) {
                    const stateConsumer = isState(value) ? value.use() : value
                    const result = stateConsumer.render()

                    if (result instanceof VNode) {
                        value = result
                    } else {
                        value = String(result)
                    }

                    if (Array.isArray(stateConsumer.states)) {
                        stateConsumer.states.forEach(state => state._tieNodeProp(node, stateConsumer, key))
                    } else {
                        stateConsumer.states._tieNodeProp(node, stateConsumer, key)
                    }
                }

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
            .forEach(child => renderTo(child, node, !rerender))
    }
}
