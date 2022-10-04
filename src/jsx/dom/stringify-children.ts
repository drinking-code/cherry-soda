import escapeHtml from 'escape-html'

import {ElementChildren} from '../ElementChildren'
import {ElementId, isVirtualElement} from '../VirtualElement'
import isState from '../../state/is-state'
import {StateType} from '../../state'

if (!global['stateTemplates'])
    global['stateTemplates'] = new Map()
type StateMappingType = {
    element: ElementId['fullPath']
    // number of sibling nodes (excluding text nodes) before this text node
    childrenBefore: number
    content: Array<string | StateType>
}
export const stateTemplates: Map<string, Set<StateMappingType>> = global['stateTemplates']

export default function stringifyChildren(children: ElementChildren, elementId: ElementId): Array<string> {
    let elementIndex = 0
    const textContents = []
    return children
        .map((child) => {
            if (isVirtualElement(child)) {
                child.props.ref?.populate(child)
                const rendered = child.render(elementIndex++, elementId)
                if (Array.isArray(rendered)) {
                    elementIndex += rendered.length - 1
                    return rendered.join('')
                }
                textContents.splice(0, textContents.length)
                return rendered
            }
            const stringified = escapeHtml(child.toString())
            if (isState(child)) {
                textContents.push(child)
                const stateId: string = child.$$stateId.serialize()
                if (!stateTemplates.has(stateId))
                    stateTemplates.set(stateId, new Set())
                stateTemplates.get(child.$$stateId.serialize()).add({
                    element: elementId.fullPath,
                    childrenBefore: elementIndex,
                    content: textContents
                })
            } else {
                textContents.push(stringified)
            }
            // todo: handle objects
            return stringified
        })
}
