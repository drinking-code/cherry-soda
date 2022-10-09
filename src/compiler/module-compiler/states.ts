import escapeHtml from 'escape-html'

import isState from '../../state/is-state'
import {ElementId, isVirtualElement, VirtualElement} from '../../jsx/VirtualElement'
import {StateType} from '../../state'

let textContents: Array<string | StateType> = []
let currentElementId

interface StateMappingType {
    element: ElementId['fullPath']
    childrenBefore: number
    content: Array<string | StateType>
}

export const stateTemplates: Map<string, Set<StateMappingType>> = new Map()

export function collectStatesTemplates(child: any, elementIndex: number, elementId: ElementId): VirtualElement | StateType | string {
    if (isVirtualElement(child) || currentElementId !== elementId)
        textContents = []
    if (isVirtualElement(child))
        return child
    currentElementId = elementId
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
        return child
    } else {
        textContents.push(stringified)
    }
    return stringified
}

export function stringifyStateMapping(): string {
    function convertStates(content: StateMappingType['content']): Array<string | { state: string }> {
        return content.map((entry) => {
            if (isState(entry)) {
                return {state: entry.$$stateId.serialize()}
            }
            return entry
        })
    }

    let string = '{'

    string += Array.from(stateTemplates.entries())
        .map(([stateId, stateUses]) =>
            `"${stateId}"` +
            ':[' +
            Array.from(stateUses.values())
                .map(stateUse =>
                    '{element:' +
                    `findElement([${stateUse.element.join(',')}])` +
                    ',childrenBefore:' +
                    stateUse.childrenBefore.toString() +
                    ',content:[' +
                    convertStates(stateUse.content).map(component => {
                        if (typeof component === 'string')
                            return `"${component}"`
                        else
                            return `getState("${component.state}")`
                    }).join(',') +
                    ']}'
                ).join(',') +
            ']'
        ).join(',')

    string += '}'

    textContents = []
    stateTemplates.clear()

    return string
}
