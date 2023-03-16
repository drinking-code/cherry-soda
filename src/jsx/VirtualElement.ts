import {VirtualElementInterface} from './cherry-cola'
import {numberToAlphanumeric} from '../utils/number-to-string'

export type HashType = string

export class VirtualElement implements VirtualElementInterface {
    type: VirtualElementInterface['type']
    function: VirtualElementInterface['function']
    props: VirtualElementInterface['props']
    children: VirtualElementInterface['children']
    _id: ElementId

    constructor(type: VirtualElement['type'], props: VirtualElement['props'], children?: VirtualElement['children']) {
        this.type = type
        if (typeof type === 'function') {
            this.type = 'component'
            this.function = type
        }
        this.props = props
        this.children = children
    }

    hash(): HashType {
        return numberToAlphanumeric(Bun.hash(this.function.toString()) as number)
    }

    trace(index: number = 0, parent: VirtualElement | ElementId | null) {
        if (isVirtualElement(parent))
            parent = parent._id
        this._id = new ElementId(index, parent, this)
    }

    get id(): (number | HashType)[] {
        return this._id.fullPath
    }
}

export function isVirtualElement(item): item is VirtualElement {
    // instanceof VirtualElement won't work in node because esbuild generates multiple files with the same class
    return item.constructor?.name === VirtualElement.name
}


export class ElementId {
    parent: ElementId | null
    fullPath: (number | HashType)[]
    element: VirtualElement

    constructor(index: number, parent: ElementId | null, element: VirtualElement) {
        if (element.type === 'component') {
            this.fullPath = [element.hash()]
        } else {
            this.fullPath = parent && parent.fullPath ? [...parent.fullPath, index] : [index]
        }
        this.parent = parent
        this.element = element
    }
}
