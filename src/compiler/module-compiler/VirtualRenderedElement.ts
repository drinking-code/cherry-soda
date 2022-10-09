import {validTags, voidElements} from '../../jsx/dom/html-props'
import {StateType} from '../../state'

const TextTag = Symbol.for('#text')

class VirtualRenderedElement {
    tagName: typeof validTags[number] | typeof voidElements[number] | typeof TextTag
    children?: VirtualRenderedElement[]
    text?: string | StateType

    constructor(tagName: VirtualRenderedElement["tagName"]) {
        this.tagName = tagName
        if (tagName !== TextTag)
            this.children = []
    }

    appendText(text: string | StateType) {
        const node = new VirtualRenderedElement(TextTag)
        node.text = text
        this.children.push(node)
    }

    isEqualTo(element: VirtualRenderedElement, recursive: boolean = true) {

    }
}
