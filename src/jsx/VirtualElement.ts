import {ComponentType} from "./factory";
import {renderElement} from "../dom/render";
import {ElementChildren} from "./ElementChildren";

export class VirtualElement<P = {}> {
    type: ComponentType<P> | string;
    function?: Function;
    props: P;
    children: ElementChildren;

    constructor(type: VirtualElement['type'], props: P, children?: ElementChildren) {
        this.type = type
        if (typeof type === 'function') {
            this.type = 'function'
            this.function = type
        }
        this.props = props
        this.children = children
    }

    render(): string {
        return renderElement(this)
    }
}
