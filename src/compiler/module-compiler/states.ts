import escapeHtml from 'escape-html'

import isState from '../../state/is-state'
import {ElementId, isVirtualElement} from '../../jsx/VirtualElement'
import {StateType} from "../../state";

const textContents: Array<string | StateType> = []

interface StateMappingType {
    element: ElementId['fullPath']
    childrenBefore: number
    content: Array<string | StateType>
}

export const stateTemplates: Map<string, Set<StateMappingType>> = new Map()

export function collectStatesTemplates(child: any, elementIndex: number, elementId: ElementId) {
    if (isVirtualElement(child)) {
        textContents.splice(0, textContents.length)
        return
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

    const stateMappingEntries = Array.from(stateTemplates.entries())
        .map(([stateId, stateUses]) => [
            stateId,
            Array.from(stateUses.values())
                .map(stateUse => {
                    interface StateMappingTypeConvertedStates extends Omit<StateMappingType, 'content'> {
                        content: Array<string | { state: string }>
                    }

                    const stateUseWithConvertedStates: StateMappingTypeConvertedStates = {
                        ...stateUse,
                        content: convertStates(stateUse.content)
                    }
                    return stateUseWithConvertedStates
                })
        ])

    textContents.splice(0, textContents.length)
    stateTemplates.clear()

    return JSON.stringify(Object.fromEntries(stateMappingEntries))
}
