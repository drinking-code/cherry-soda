import {StateType} from '../../state'
import {EmptyTag, TextTag, VirtualRenderedElement} from './VirtualRenderedElement'
import {ElementId} from '../../jsx/VirtualElement'
import isState from '../../state/is-state'
import {SerializedStateId} from '../../state/state-id'

export interface DiffData {
    elementId: ElementId['fullPath']
    property: 'tag' | 'text' | 'state' | 'childrenLength'
    newValue: string | (string | { state: SerializedStateId })[] | number
}

export function diff(this: VirtualRenderedElement, element: VirtualRenderedElement, recursive: boolean, data: DiffData[]): DiffData[] {
    // don't compare states: there is really no reason to track states on the server (across renders)
    const id = this.backRef?.fullPath ?? []
    if (element.tag !== this.tag) {
        data.push({
            elementId: id,
            property: 'tag',
            newValue: element.tagName
        })
    }
    if (!compareContentArrays(element.content, this.content)) {
        data.push({
            elementId: id.slice(0, id.length - 1),
            property: 'text',
            newValue: element.content.map(part =>
                typeof part === 'string'
                    ? part
                    : {state: part.$$stateId.serialize()}
            )
        })
    }
    // todo: support wrapping elements
    // todo: support unwrapping elements
    // todo: support appending / prepending elements
    if (element.tag !== TextTag && element.children?.length !== this.children?.length)
        data.push({
            elementId: id,
            property: 'childrenLength',
            newValue: element.children?.length ?? 0
        })
    if (element.children && recursive)
        for (let i = 0; i < Math.max(this.children.length, element.children.length); i++) {
            if (!element.children[i]) continue
            (this.children[i] ?? new VirtualRenderedElement(EmptyTag, element.children[i].backRef))
                .getDiff(element.children[i], recursive, data)
        }
    return data
}

function compareContentArrays(contentArrayA: Array<string | StateType>, contentArrayB: Array<string | StateType>): boolean {
    if (!contentArrayA && !contentArrayB) return true
    if (!contentArrayA !== !contentArrayB) return false
    for (let i = 0; i < contentArrayA.length; i++) {
        if (
            (typeof contentArrayA[i] === 'string' && contentArrayA[i] !== contentArrayB[i]) ||
            isState(contentArrayA[i]) !== isState(contentArrayB[i])
        ) return false
    }
    return true
}
