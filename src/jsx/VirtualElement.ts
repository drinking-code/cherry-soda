import {ComponentType} from "./factory";
import {renderElement} from "../dom/render";
import {ElementChildren} from "./ElementChildren";

export class VirtualElement<P = {}> {
    type: ComponentType<P> | string;
    function?: Function;
    props: P;
    children: ElementChildren;
    private _id?: ElementId;

    constructor(type: VirtualElement['type'], props: P, children?: ElementChildren) {
        this.type = type
        if (typeof type === 'function') {
            this.type = 'function'
            this.function = type
        }
        this.props = props
        this.children = children
    }

    render(index: number = 0, parent: ElementId | null): string | string[] {
        this._id = new ElementId(index, parent, this)
        return renderElement(this)
    }

    get id() {
        return this._id
    }
}

export class ElementId {
    parent: ElementId | null;
    origin?: 'html' | 'head' | 'body';
    index: number;
    fullPath?: number[];
    element: VirtualElement

    constructor(index: number, parent: ElementId | null, element: VirtualElement) {
        this.parent = parent
        this.index = index
        if (parent?.fullPath)
            this.fullPath = [...this.parent.fullPath, this.index]
        if (['html', 'head', 'body'].includes(element.type as string)) {
            // @ts-ignore Type 'string | ComponentType<{}>' is not assignable to type '"head" | "body"'
            this.origin = element.type
            this.fullPath = []
        } else if (parent?.origin)
            this.origin = parent.origin
        this.element = element
    }
}
