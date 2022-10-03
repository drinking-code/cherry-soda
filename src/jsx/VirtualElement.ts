import {renderElement} from './dom/render'
import {ElementChildren} from './ElementChildren'
import {PropsType} from './dom/props-type'
import {validTags, voidElements} from './dom/html-props'
import {Fragment} from './factory'

export class VirtualElement<P = PropsType> {
    type: 'function' | typeof validTags[number] | typeof voidElements[number];
    function?: (PropsType) => VirtualElement | ElementChildren;
    props: PropsType;
    children: ElementChildren;
    private _id?: ElementId;

    constructor(type: VirtualElement['type'], props: PropsType, children?: ElementChildren) {
        this.type = type
        if (typeof type === 'function') {
            this.type = 'function'
            this.function = type
        }
        this.props = props
        this.children = children
    }

    render(index: number = 0, parent: ElementId | null): string | string[] {
        this.trace(index, parent)
        return renderElement(this)
    }

    trace(index: number = 0, parent: ElementId | null) {
        this._id = new ElementId(index, parent, this)
    }

    get id() {
        return this._id
    }
}

export function isVirtualElement(item): item is VirtualElement {
    // instanceof VirtualElement won't work in node because esbuild generates multiple files with the same class
    return item.constructor?.name === VirtualElement.name
}

export class ElementId {
    parent: ElementId | null;
    origin?: 'html' | 'head' | 'body';
    index: number;
    fullPath?: number[];
    element: VirtualElement

    // <body> would be {origin: 'body', fullPath: []} OR {origin: 'html', fullPath: [0]}
    // first child of <body> would be {origin: 'body', fullPath: [0]}

    constructor(index: number, parent: ElementId | null, element: VirtualElement) {
        this.parent = parent
        this.index = index
        this.element = element

        this.fullPath = [...(this.parent?.fullPath ?? [])]
        this.fullPath.push(this.index)
        this.origin = parent?.origin

        if (['html', 'head', 'body'].includes(element.type.toString())) {
            this.origin = element.type as typeof this.origin
            this.fullPath = []
        }
    }
}
