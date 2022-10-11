import {validTags, voidElements} from '../../jsx/dom/html-props'
import {GenericState, StateType} from '../../state'
import {SerializedStateId, StateId} from '../../state/state-id'
import {ElementId} from '../../jsx/VirtualElement'

const TextTag = Symbol.for('#text')
export const RootTag = Symbol.for('#root')
const EmptyTag = Symbol.for('#empty')

interface SerialisedVirtualRenderedElement {
    tag: typeof validTags[number] | typeof voidElements[number] | '#text' | '#root'
    backRef: Array<number>
    children?: SerialisedVirtualRenderedElement[]
    text?: string
    state?: SerializedStateId
}

interface DiffData {
    elementId: ElementId['fullPath']
    property: 'tag' | 'text' | 'state' | 'childrenLength'
    newValue: string | StateType | number
}

export class VirtualRenderedElement {
    tag: typeof validTags[number] | typeof voidElements[number] | typeof TextTag | typeof RootTag | typeof EmptyTag
    children?: VirtualRenderedElement[]
    text?: string
    state?: StateType
    private readonly backRef?: ElementId

    constructor(tagName: VirtualRenderedElement['tag'], elementId: ElementId) {
        if (elementId)
            this.backRef = elementId
        this.tag = tagName
        if (tagName !== TextTag)
            this.children = []
    }

    appendText(text: string | StateType) {
        if (text === '') return false
        const node = new VirtualRenderedElement(
            TextTag,
            this.backRef
                ? ElementId.fromPath([...this.backRef.fullPath, this.children.length])
                : undefined
        )
        if (typeof text === 'string') {
            node.text = text
        } else {
            node.state = text
        }
        this.children.push(node)
    }

    append(...element: VirtualRenderedElement[]) {
        this.children.push(...element)
    }

    clean() {
        if (this.tag !== RootTag)
            console.warn('You should probably not call VirtualRenderedElement.clean() here')
        this.children = []
        delete this.text
    }

    getDiff(element: VirtualRenderedElement, recursive: boolean = true, data: DiffData[] = []): DiffData[] {
        // don't compare states: there is really no reason to track states on the server (across renders)
        const id = this.backRef?.fullPath ?? []
        if (element.tag !== this.tag)
            data.push({
                elementId: id,
                property: 'tag',
                newValue: element.tagName
            })
        if (element.text !== this.text)
            data.push({
                elementId: id,
                property: 'text',
                newValue: element.text
            })
        if (!!element.state !== !!this.state)
            data.push({
                elementId: id,
                property: 'state',
                newValue: element.state
            })
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
                    .getDiff(element.children[i], true, data)
            }
        return data
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
        if (this.text) {
            serialised.text = this.text
        }
        if (this.state) {
            serialised.state = this.state.$$stateId.serialize()
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
        if (elementData.text) {
            element.text = elementData.text
        }
        if (elementData.state) {
            element.state = new GenericState(StateId.from(elementData.state))
        }
        return element
    }
}
