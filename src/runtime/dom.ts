import {type ElementId, type HashType} from '../jsx/VirtualElement'
import {type ClientTemplatesMapType} from '../compiler/template/types'
import {AbstractState} from './abstract-state'

declare const refs: { [refId: string]: ElementId['fullPath'][] }
declare const templates: ClientTemplatesMapType
declare const templatesEntry: HashType

export class Ref<V extends HTMLElement | HTMLElement[]> extends AbstractState<V> {
    constructor(value: V) {
        super(value)
    }
}

export function findNode(refId: string) {
    const nodePaths = refs[refId]
    const nodes: HTMLElement[] = nodePaths.map(findElementByPath)
    return new Ref(nodes.length <= 1 ? nodes[0] : nodes)
}

export function findElementByPath(nodePath: number[]) {
    nodePath = [...nodePath]
    let node: { children: HTMLCollection } = document
    do {
        node = node.children[nodePath.shift()]
    } while (nodePath.length > 0)
    return node as HTMLElement
}
