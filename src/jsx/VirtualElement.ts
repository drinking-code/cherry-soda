import {ElementChildren} from './ElementChildren'
import {Props} from './dom/props-type'
import {validTags, voidElements} from './dom/html-props'

export class VirtualElement<P = Props> {
    type: 'function' | typeof validTags[number] | typeof voidElements[number]
    function?: (props: Props) => VirtualElement | ElementChildren
    props: Props
    children: ElementChildren
    // private _id?: ElementId

    constructor(type: VirtualElement['type'], props: Props, children?: ElementChildren) {
        this.type = type
        if (typeof type === 'function') {
            this.type = 'function'
            this.function = type
        }
        this.props = props
        this.children = children
    }
}

export function isVirtualElement(item): item is VirtualElement {
    // instanceof VirtualElement won't work in node because esbuild generates multiple files with the same class
    return item.constructor?.name === VirtualElement.name
}
