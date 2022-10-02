import {VirtualElement} from './VirtualElement'

export default function createRef() {
    return new Ref()
}

export class Ref<P = VirtualElement> {
    private element: VirtualElement

    populate(element: VirtualElement) {
        this.element = element
    }

    stringify() {
        return JSON.stringify(this.element?.id?.fullPath)
    }
}

export function isRef(value): value is Ref {
    return value.constructor.name === 'Ref'
}
