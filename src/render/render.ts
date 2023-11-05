import {type JSX} from '../index'
import {ComponentChild} from '../jsx/types/elements'
import VNode, {yieldsDomNodes} from '../jsx/VNode'
import {Fragment} from '../jsx/factory'
import {ensureArray} from '../utils/array'
import {isStateConsumer} from '../state/StateConsumer'
import {isState} from '../state/State'
import {registerElementRenderEnd, registerElementRenderStart} from './hmr/render-with-old-states'

let currentNodePath: VNode[] = []

const TextNode = Symbol.for('TextNode')
const RawNode = Symbol.for('RawNode')

interface MinimallyCompatibleNodeData {
    type: typeof TextNode | typeof RawNode,
    _dom: Node,
    _parent: VNode,
}

export function placeholderForStateComment() {
    return document.createComment('Placeholder for surgical state updates')
}

export function renderChild(child: ComponentChild, parent: JSX.Element, insertAt?: number) {
    if (child instanceof VNode) {
        return renderNode(child, insertAt)
    } else if (isState(child) || isStateConsumer(child)) {
        const stateConsumer = isState(child) ? child.use() : child
        const result = stateConsumer.render()

        const childToRender = yieldsDomNodes(result) ? result : placeholderForStateComment()
        const renderedChild = renderChild(childToRender, parent, insertAt)
        // because fragment node cannot be tracked as a dom element, the children are tracked, and fragment becomes the parent
        let parentNode = renderedChild.type === Fragment ? renderedChild : parent
        let nodes = renderedChild.type === Fragment
            ? renderedChild._fragmentChildren
            : [renderedChild._dom as HTMLElement]

        if (Array.isArray(stateConsumer.states)) {
            stateConsumer.states.forEach(state => state._tieNodeChild(parentNode, stateConsumer, nodes))
        } else {
            stateConsumer.states._tieNodeChild(parentNode, stateConsumer, nodes)
        }
    } else {
        const useRawNode = child instanceof Node
        const node = useRawNode ? child : document.createTextNode(String(child))
        if (!insertAt) parent._dom.append(node)
        else insertNodeAt(parent._actualDom, node, insertAt)
        return {
            type: useRawNode ? RawNode : TextNode,
            _dom: node,
            _parent: parent
        } as MinimallyCompatibleNodeData
    }
}

function insertNodeAt(parent: HTMLElement | DocumentFragment, node: Node, index: number) {
    if (index && parent.childNodes.length > index) {
        parent.insertBefore(node, parent.childNodes[index])
    } else parent.append(node)
}

export function renderNode(node: JSX.Element, insertAt?: number) {
    if (process.env.NODE_ENV === 'development' && module.hot) registerElementRenderStart(node)

    node._parent ??= currentNodePath.at(-1)
    currentNodePath.push(node)

    const isDOM = typeof node.type === 'string'
    const isComponent = typeof node.type === 'function'
    const isFragment = node.type === Fragment

    if (isFragment || isComponent) {
        node._dom ??= node._parent._dom
    }

    if (isDOM) {
        renderVNodeDomElement(node)
        node.postRender()
    }

    if (isComponent) {
        node.type(node.props)
    }

    if (isFragment) {
        node._dom = document.createDocumentFragment()
    }

    if ((isDOM || isFragment) && 'children' in node.props) {
        for (const child of ensureArray<ComponentChild>(node.props.children)) {
            renderChild(child, node)
        }
    }

    if (isFragment) {
        // @ts-ignore
        node._fragmentChildren = Array.from(node._dom.childNodes.values())
    }

    if (node._parent) {
        if (!insertAt) node._parent._dom.append(node._dom)
        else insertNodeAt(node._parent._actualDom, node._dom, insertAt)
    }

    if (currentNodePath.at(-1) === node) currentNodePath.pop()

    if (process.env.NODE_ENV === 'development' && module.hot) registerElementRenderEnd(node)

    return node
}

export function renderVNodeDomElement(node: JSX.Element) {
    if (typeof node.type !== 'string') throw new TypeError('VNode not element type')
    node._dom = document.createElement(node.type)
    for (let key in node.props) {
        let value = node.props[key]
        if (key === 'children') continue
        if (key === 'className') key = 'class'

        if (isState(value) || isStateConsumer(value)) {
            const stateConsumer = isState(value) ? value.use() : value
            const result = stateConsumer.render()
            value = String(result)

            if (Array.isArray(stateConsumer.states)) {
                stateConsumer.states.forEach(state => state._tieNodeProp(node, stateConsumer, key))
            } else {
                stateConsumer.states._tieNodeProp(node, stateConsumer, key)
            }
        }

        node._dom.setAttribute(key, value as any)
    }
}
