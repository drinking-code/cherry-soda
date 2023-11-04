import {type JSX} from '../index'
import {renderNode} from './render'
import {isEqualVNode} from '../jsx/VNode'

export function defineDom(node: JSX.Element): void {
    renderNode(node)
}

const mountedElementDomEntry: Map<JSX.Element, HTMLElement> = new Map()
const domEntryMountedElement: Map<HTMLElement, JSX.Element> = new Map()

export function mount(node: JSX.Element, to: HTMLElement): void {
    if (module.hot.status() !== 'apply') {
        if (domEntryMountedElement.has(to)) {
            if (isEqualVNode(domEntryMountedElement.get(to), node)) {
                throw new Error('Trying to mount component to DOM node multiple times')
            } else {
                console.warn('Mounting multiple components to the same DOM node may cause unwanted side-effects.')
            }
        }
    } else {
        to.innerHTML = ''
    }
    node._dom = to
    domEntryMountedElement.set(to, node)
    mountedElementDomEntry.set(node, to)
    defineDom(node)
}
