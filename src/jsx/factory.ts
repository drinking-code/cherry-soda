import {VirtualElement} from './VirtualElement'
import {ElementChildren} from './ElementChildren'
import {Props} from './dom/props-type'

function createVirtualElement(
    type: VirtualElement['type'] | typeof Fragment,
    props: Props & { children: ElementChildren },
    key: any,
    _self: string,
    _source: string
): VirtualElement | ElementChildren {
    const children = new ElementChildren(props.children)
    delete props.children
    if (type === Fragment)
        return children

    return new VirtualElement(type, props, children)
}

const Fragment = Symbol.for('cherry-cola.fragment')

export {
    createVirtualElement as jsx,
    createVirtualElement as jsxs,
    createVirtualElement as jsxDEV,
    Fragment
}
