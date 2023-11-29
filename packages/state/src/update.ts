import {isElement, Fragment} from '@cherry-soda/core'
import type {TiedNodeChildrenData, TiedNodePropData} from './State'

export function updateNodeChild(tiedNodeChildrenData: TiedNodeChildrenData) {
    const {parent, domNodes, consumer, render} = tiedNodeChildrenData
    const result = consumer.render()
    for (let i = 0; i < domNodes.length; i++) domNodes[i].remove()

    if (isElement(result)) {
        if (result.type === Fragment) result._parent = parent._parent
        else result._parent = parent
    }
    const renderedChild = render(result)
    tiedNodeChildrenData.domNodes = renderedChild.type === Fragment
        ? renderedChild._fragmentChildren
        : [renderedChild._dom as HTMLElement]
}

export function updateNodeProp(tiedNodePropData: TiedNodePropData) {
    const {node, prop, consumer} = tiedNodePropData
    const result = consumer.render()
    const value = isElement(result) ? result : String(result)
    if (node._dom instanceof HTMLElement)
        node._dom.setAttribute(prop, value as any)
}
