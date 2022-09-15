import {VirtualElement} from './VirtualElement';
import {ElementChildren} from './ElementChildren';

function createVirtualElement(
    type: VirtualElement['type'],
    props: {} & { children: ElementChildren },
    key: any,
    _self: string,
    _source: string
): VirtualElement {
    const children = new ElementChildren(props.children)
    delete props.children

    return new VirtualElement(type, props, children)
}

const Fragment = Symbol.for('cherry-cola.fragment')

export {
    createVirtualElement as jsx,
    createVirtualElement as jsxs,
    createVirtualElement as jsxDEV,
    Fragment
}
