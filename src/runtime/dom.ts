import {ElementId, HashType} from '../jsx/VirtualElement'
import {ClientTemplatesMapType} from '../compiler/template/types'
import {TemplateParser} from './template-parser'
import {AbstractState} from './client-state'

declare const refs: { [refId: string]: ElementId['fullPath'][] }
declare const templates: ClientTemplatesMapType
declare const templatesEntry: HashType

const domMethods = {
    createDomElement: tag => new VirtualNode(tag),
    createTextNode: text => text,
    isDomElement: node => node instanceof VirtualNode,
    setAttribute: (object: VirtualNode, key, value) => object.setAttribute(key, value),
    appendElement: (parent: VirtualNode, object: VirtualNode | string) => parent.append(object),
}

export class Ref<V extends HTMLElement | HTMLElement[]> extends AbstractState<V> {
    constructor(value: V) {
        super(value)
    }
}

export function findNode(refId: string) {
    const nodePaths = refs[refId]
    const nodes: HTMLElement[] = nodePaths.map(nodePath => {
        let node: { children: HTMLCollection } = document
        do {
            node = node.children[nodePath.shift()]
        } while (nodePath.length > 0)
        return node as HTMLElement
    })
    return new Ref(nodes.length <= 1 ? nodes[0] : nodes)
}

class VirtualNode {
    tagName: string
    props: { [key: string]: string } = {}
    children: (VirtualNode | string)[] = []

    constructor(tagName: string) {
        this.tagName = tagName
    }

    setAttribute(key, value) {
        this.props[key] = value
    }

    append(node: VirtualNode | string) {
        this.children.push(node)
    }
}
