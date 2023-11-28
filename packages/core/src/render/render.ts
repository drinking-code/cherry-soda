import {type JSX} from '../index'
import {ComponentChild} from '../jsx/types/elements'
import VNode from '../jsx/VNode'
import {Fragment} from '../jsx/factory'
import {ensureArray} from '../utils/array'
// import {isStateConsumer} from '../state/StateConsumer'
// import {isState} from '../state/State'
import {registerElementRenderEnd, registerElementRenderStart} from './hmr/render-with-old-states'
import {renderHooks} from './hooks'

let currentNodePath: VNode[] = []

const TextNode = Symbol.for('TextNode')
const RawNode = Symbol.for('RawNode')

export interface MinimallyCompatibleNodeData {
    type: typeof TextNode | typeof RawNode,
    _dom: Node,
    _parent: VNode,
}

export function placeholderForStateComment() {
    return document.createComment('^w^')
}

interface RenderOptions {
    insertAt?: number,
    fallbackDom?: Comment
}

export function renderChild(child: ComponentChild, parent: JSX.Element, renderOptions?: RenderOptions) {
    if (child instanceof VNode) {
        return renderNode(child, renderOptions)
    } else {
        let matchingHook: typeof renderHooks extends Map<any, infer I> ? I : never
        for (let matcher of renderHooks.keys()) {
            if (matcher(child)) {
                matchingHook = renderHooks.get(matcher)
                break
            }
        }
        let insertAt: RenderOptions['insertAt'], fallbackDom: RenderOptions['fallbackDom']
        if (renderOptions) ({insertAt, fallbackDom} = renderOptions)

        if (matchingHook) {
            matchingHook(child, (child) => renderChild(
                child,
                parent,
                {insertAt, fallbackDom: placeholderForStateComment()}
            ))
        } else {
            const useFallback = fallbackDom && (child === null || child === undefined)
            const useRawNode = child instanceof Node
            let node: Node
            if (useFallback) node = fallbackDom
            else if (!useRawNode) node = document.createTextNode(String(child))
            else node = child

            if (!insertAt) parent._dom.append(node)
            else insertNodeAt(parent._actualDom, node, insertAt)

            return {
                type: useRawNode || useFallback ? RawNode : TextNode,
                _dom: node,
                _parent: parent
            } as MinimallyCompatibleNodeData
        }
    }
}

function insertNodeAt(parent: HTMLElement | DocumentFragment, node: Node, index: number) {
    if (index && parent.childNodes.length > index) {
        parent.insertBefore(node, parent.childNodes[index])
    } else parent.append(node)
}

export function renderNode(
    node: JSX.Element,
    renderOptions?: RenderOptions
): typeof node {
    if (process.env.NODE_ENV === 'development' && module.hot) registerElementRenderStart(node)
    let insertAt: RenderOptions['insertAt'], fallbackDom: RenderOptions['fallbackDom']
    if (renderOptions) ({insertAt, fallbackDom} = renderOptions)

    node._parent ??= currentNodePath.at(-1)
    currentNodePath.push(node)
    if (node._parent && typeof node._parent.type === 'function') {
        node._parent._childNode = node
    }

    const isDOM = typeof node.type === 'string'
    const isComponent = typeof node.type === 'function'
    const isFragment = node.type === Fragment

    if (isDOM) {
        renderVNodeDomElement(node)
    }

    if (isComponent) {
        // proxy this dom to parent
        if (node._parent) node._dom = node._parent._dom
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

    if (fallbackDom) {
        const fallback = fallbackDom as unknown as HTMLElement // trust me bro
        if (isFragment && node._dom.childNodes.length === 0) {
            node._dom.append(fallback)
        } else if (isComponent && false /* todo */) {
            node._dom = fallback
        }
    }

    if (isFragment) {
        // @ts-ignore
        node._fragmentChildren = Array.from(node._dom.childNodes.values())
    }

    if (node._parent && !isComponent) {
        if (!insertAt) node._parent._dom.append(node._dom)
        else insertNodeAt(node._parent._actualDom, node._dom, insertAt)
    }

    node.postRender()
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

        /*if (isState(value) || isStateConsumer(value)) {
            const stateConsumer = isState(value) ? value.use() : value
            const result = stateConsumer.render()
            value = String(result)

            if (Array.isArray(stateConsumer.states)) {
                stateConsumer.states.forEach(state => state._tieNodeProp(node, stateConsumer, key))
            } else {
                stateConsumer.states._tieNodeProp(node, stateConsumer, key)
            }
        }*/

        node._dom.setAttribute(key, value as any)
    }
}
