import {ElementId, HashType} from '../jsx/VirtualElement'
import {ClientTemplatesMapType} from '../compiler/template/types'
import {TemplateParser} from './template-parser'

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

export function findNode(refId: string) {
    console.log(refs[refId])
    // console.log(templates[templatesEntry])
    // console.log(templatesEntry)
    // const parser = new TemplateParser(templates[refs[refId][0][0]], domMethods)
    // const parserEntry = new TemplateParser(templates[templatesEntry], domMethods)
    // parser.parseTemplate()
    // parserEntry.parseTemplate(templates)
    // console.log(parser.elements)
    // console.log(parserEntry.elements)
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
