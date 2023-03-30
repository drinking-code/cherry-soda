import {HashType} from './VirtualElement'
import {getCurrentComponentHash} from '../compiler/template/template-builder'

export function unsafeInsertHtmlDoNotUse(value: string) {
    return new UnsafeHTML(value)
}

export class UnsafeHTML {
    private readonly componentHash: HashType
    private readonly value: string

    constructor(value: string) {
        this.componentHash = getCurrentComponentHash()
        this.value = value
    }

    valueOf(): UnsafeHTML['value'] {
        return this.value
    }
}
