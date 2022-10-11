import {validTags, voidElements} from '../../jsx/dom/html-props'
import {GenericState, StateType} from '../../state'
import {SerializedStateId, StateId} from '../../state/state-id'
import {ElementId} from '../../jsx/VirtualElement'
import {diff, DiffData} from './diff'

export const TextTag = Symbol.for('#text')
export const RootTag = Symbol.for('#root')
export const EmptyTag = Symbol.for('#empty')

interface SerialisedVirtualRenderedElement {
    tag: typeof validTags[number] | typeof voidElements[number] | '#text' | '#root'
    backRef: Array<number>
    children?: SerialisedVirtualRenderedElement[]
    content?: (string | { state: SerializedStateId })[]
}

export class VirtualRenderedElement {
    tag: typeof validTags[number] | typeof voidElements[number] | typeof TextTag | typeof RootTag | typeof EmptyTag
    children?: VirtualRenderedElement[]
    content?: (string | StateType)[]
    readonly backRef?: ElementId

    constructor(tagName: VirtualRenderedElement['tag'], elementId: ElementId) {
        if (elementId)
            this.backRef = elementId
        this.tag = tagName
        if (tagName !== TextTag)
            this.children = []
    }

    appendText(text: string | StateType) {
        if (text === '') return false
        const lastChild = this.children[this.children.length - 1]
        if (lastChild && lastChild.tag === TextTag) {
            lastChild.content.push(text)
        } else {
            const node = new VirtualRenderedElement(
                TextTag,
                this.backRef
                    ? ElementId.fromPath([...this.backRef.fullPath, this.children.length])
                    : undefined
            )
            node.content = [text]
            this.children.push(node)
        }
    }

    append(...element: VirtualRenderedElement[]) {
        this.children.push(...element)
    }

    clean() {
        if (this.tag !== RootTag)
            console.warn('You should probably not call VirtualRenderedElement.clean() here')
        this.children = []
        delete this.content
    }

    getDiff(element: VirtualRenderedElement, recursive: boolean = true, data: DiffData[] = []): DiffData[] {
        return diff.call(this, element, recursive, data)
    }

    get tagName(): SerialisedVirtualRenderedElement['tag'] {
        if (this.tag === TextTag) {
            return '#text'
        } else if (this.tag === RootTag) {
            return '#root'
        } else if (typeof this.tag === 'string') {
            return this.tag
        }
    }

    static toTag(tagName: SerialisedVirtualRenderedElement['tag']): VirtualRenderedElement['tag'] {
        if (tagName === '#text') {
            return TextTag
        } else if (tagName === '#root') {
            return RootTag
        } else {
            return tagName
        }
    }

    serialize(): SerialisedVirtualRenderedElement {
        const serialised: SerialisedVirtualRenderedElement = {
            tag: this.tagName,
            backRef: this.backRef?.fullPath ?? [],
        }
        if (this.children) {
            serialised.children = this.children.map(child => child.serialize())
        }
        if (this.content) {
            serialised.content = this.content.map(part =>
                typeof part === 'string'
                    ? part
                    : {state: part.$$stateId.serialize()}
            )
        }
        return serialised
    }

    static from(elementData: SerialisedVirtualRenderedElement): VirtualRenderedElement {
        const element = new VirtualRenderedElement(
            VirtualRenderedElement.toTag(elementData.tag),
            ElementId.fromPath(elementData.backRef)
        )
        if (elementData.children)
            element.children = elementData.children.map(childData => VirtualRenderedElement.from(childData))
        if (elementData.content) {
            element.content = elementData.content.map(part =>
                typeof part === 'string'
                    ? part
                    : new GenericState(StateId.from(part.state))
            )
        }
        return element
    }
}
