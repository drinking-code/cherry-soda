import {ComponentChild, ComponentChildren, ComponentType} from './factory';
import {renderElement} from "../dom/render";

function createVirtualElement(
    type: VirtualElement['type'],
    props: VirtualElement['props'],
    key: /*VirtualElement['key']*/ any,
    _self: string,
    _source: string
): VirtualElement {
    const children = (Array.isArray(props.children) ? [...props.children] : [props.children]).filter(v => v)
    delete props.children

    return new VirtualElement(type, props, children)
}

export class VirtualElement<P = {}> {
    type: ComponentType<P> | string;
    function?: Function;
    props: P & { children: ComponentChildren };
    children: ComponentChild[];

    constructor(type: VirtualElement['type'], props: P & { children: ComponentChildren }, children?: ComponentChild[]) {
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

export {
    createVirtualElement as jsx,
    createVirtualElement as jsxs,
    createVirtualElement as jsxDEV,
    // Fragment
}
