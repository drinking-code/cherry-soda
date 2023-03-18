import {VirtualElement} from './VirtualElement'
import {ElementChildren} from './ElementChildren'
import {Props} from './cherry-cola'

function createVirtualElement(
    type: VirtualElement['type'] | VirtualElement['function'] | typeof Fragment,
    props: Props<VirtualElement> & { children?: ElementChildren } & { [p: string]: any }
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
