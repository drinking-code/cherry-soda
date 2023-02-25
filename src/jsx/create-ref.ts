import {VirtualElement} from './VirtualElement'

export default function createRef() {
    return new Ref()
}

export class Ref<P = VirtualElement> {
    private element: VirtualElement

    populate(element: VirtualElement) {
        this.element = element
    }
}

export function isRef(value): value is Ref {
    return value?.constructor?.name === 'Ref'
}
