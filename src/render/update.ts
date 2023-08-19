import {type JSX} from '../index'
import type {ComponentChild} from '../jsx/types/elements'
import {ensureArray} from '../utils/array'
import {renderTo} from './index'

export default function update(node: JSX.Element): void {
    if (typeof node.type === 'string') {
        const newDom = document.createElement(node.type)
        Object.entries(node.props).forEach(([key, value]) => {
            if (key === 'children') return
            if (key === 'className') key = 'class'
            newDom.setAttribute(key, value as any)
        })
        node._dom.replaceWith(newDom)
        node._dom = newDom
        node.postRender()
        if ('children' in node.props) {
            ensureArray<ComponentChild>(node.props.children)
                .forEach(child => renderTo(child, node, node._dom, true))
        }
    }
}
