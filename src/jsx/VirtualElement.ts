import {VirtualElementInterface} from './cherry-cola'

export class VirtualElement implements VirtualElementInterface {
    type: VirtualElementInterface['type']
    function: VirtualElementInterface['function']
    props: VirtualElementInterface['props']
    children: VirtualElementInterface['children']

    constructor(type: VirtualElement['type'], props: VirtualElement['props'], children?: VirtualElement['children']) {
        this.type = type
        if (typeof type === 'function') {
            this.type = 'component'
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
