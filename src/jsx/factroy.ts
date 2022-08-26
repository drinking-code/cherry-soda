import {VirtualElementType, ComponentChildren, ComponentChild} from './factory';

function createVirtualElement(
    type: VirtualElementType['type'],
    props: VirtualElementType['props'],
    key: VirtualElementType['key'],
    _self: string,
    _source: string
): VirtualElement {
    const children = (Array.isArray(props.children) ? [...props.children] : [props.children]).filter(v => v)
    delete props.children

    if (typeof type === 'function')
        console.log(type(props))

    return new VirtualElement(type, props, children)
}

export class VirtualElement {
    private type: VirtualElementType['type'];
    private function?: Function;
    private props: VirtualElementType['props'];
    private children: ComponentChild[];

    constructor(type: VirtualElementType['type'], props: VirtualElementType['props'], children?: ComponentChild[]) {
        this.type = type
        if (typeof type === 'function') {
            this.type = 'function'
            this.function = type
        }
        this.props = props
        this.children = children
    }

    render() {

    }
}

export {
    createVirtualElement as jsx,
    createVirtualElement as jsxs,
    createVirtualElement as jsxDEV,
    // Fragment
}
