import {VirtualElement} from './VirtualElement'

export default function createRef<T>() {
    return new Ref<T>()
}

export class Ref<P = VirtualElement | HTMLElement> {
    private element: P

    populate(element: P) {
        this.element = element
    }
}

export function isRef(value): value is Ref {
    return value?.constructor?.name === 'Ref'
}
