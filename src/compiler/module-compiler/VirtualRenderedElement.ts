import {validTags, voidElements} from '../../jsx/dom/html-props'
import {GenericState, StateType} from '../../state'
import {SerializedStateId, StateId} from '../../state/state-id'

const TextTag = Symbol.for('#text')

interface SerialisedVirtualRenderedElement {
    tagName: typeof validTags[number] | typeof voidElements[number] | '#text'
    children?: SerialisedVirtualRenderedElement[]
    text?: string | SerializedStateId
}

export class VirtualRenderedElement {
    tagName: typeof validTags[number] | typeof voidElements[number] | typeof TextTag
    children?: VirtualRenderedElement[]
    text?: string | StateType

    constructor(tagName: VirtualRenderedElement['tagName']) {
        this.tagName = tagName
        if (tagName !== TextTag)
            this.children = []
    }

    appendText(text: string | StateType) {
        if (text === '') return false
        const node = new VirtualRenderedElement(TextTag)
        node.text = text
        this.children.push(node)
    }

    append(element: VirtualRenderedElement) {
        this.children.push(element)
    }

    isEqualTo(element: VirtualRenderedElement, recursive: boolean = true) {
        if (element.tagName !== this.tagName ||
            element.text !== this.text ||
            element.children?.length !== this.children?.length)
            return false
        if (this.children && recursive)
            for (let i = 0; i < this.children.length; i++) {
                if (!this.children[i].isEqualTo(element.children[i]))
                    return false
            }
        return true
    }

    serialize(): SerialisedVirtualRenderedElement {
        const serialised: SerialisedVirtualRenderedElement = {
            tagName: (this.tagName == TextTag ? '#text' : this.tagName) as SerialisedVirtualRenderedElement['tagName']
        }
        if (this.children)
            serialised.children = this.children.map(child => child.serialize())
        if (this.text) {
            if (typeof this.text === 'string')
                serialised.text = this.text
            else
                serialised.text = this.text.$$stateId.serialize()
        }
        return serialised
    }

    static from(elementData: SerialisedVirtualRenderedElement): VirtualRenderedElement {
        const element = new VirtualRenderedElement(elementData.tagName === '#text' ? TextTag : elementData.tagName)
       if (elementData.children)
           element.children = elementData.children.map(childData => VirtualRenderedElement.from(childData))
       if (elementData.text) {
           if (typeof elementData.text === 'string')
               element.text = elementData.text
           else
               element.text = new GenericState(StateId.from(elementData.text))
       }
        return element
    }
}
