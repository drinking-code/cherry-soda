import VNode from '../jsx/VNode'
import type {TiedNodeChildrenData, TiedNodePropData} from '../state/State'
import {renderChild} from './render'
import {Fragment} from '../jsx/factory'

export function updateNodeChild(tiedNodeChildrenData: TiedNodeChildrenData) {
    const {parent, domNodes, consumer} = tiedNodeChildrenData
    const result = consumer.render()
    const firstDomNodeIndex = Array.from(domNodes[0].parentNode.childNodes).indexOf(domNodes[0])
    for (let i = 0; i < domNodes.length; i++) domNodes[i].remove()

    if (result instanceof VNode) {
        if (result.type === Fragment) result._parent = parent._parent
        else result._parent = parent
    }
    const renderedChild = renderChild(result, parent, firstDomNodeIndex)
    tiedNodeChildrenData.domNodes = renderedChild.type === Fragment
        ? renderedChild._fragmentChildren
        : [renderedChild._dom as HTMLElement]
}

export function updateNodeProp(tiedNodePropData: TiedNodePropData) {
    const {node, prop, consumer} = tiedNodePropData
    const result = consumer.render()
    const value = result instanceof VNode ? result : String(result)
    if (node._dom instanceof HTMLElement)
        node._dom.setAttribute(prop, value as any)
}
