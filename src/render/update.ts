import {type JSX} from '../index'
import type {ComponentChild} from '../jsx/types/elements'
import {ensureArray} from '../utils/array'
import {renderTo} from './index'

export default function update(node: JSX.Element): void {
    if (typeof node.type === 'string') {
        node._dom.innerHTML = ''
        if ('children' in node.props) {
            ensureArray<ComponentChild>(node.props.children)
                .forEach(child => renderTo(child, node, node._dom, true))
        }
    }
}
