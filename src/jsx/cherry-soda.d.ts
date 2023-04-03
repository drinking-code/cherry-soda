import {validTags, voidElements} from './dom/html-props'
import {ElementChildren} from './ElementChildren'
import {Fragment} from '#cherry-soda'
import {Ref} from '../state/create-ref'

export = CherrySoda;
export as namespace CherrySoda;

declare namespace CherrySoda {
    type JSXElementConstructor<P> = (props: P) => VirtualElementInterface | ElementChildren | null

    interface InherentProps<T> {
        unsafeInnerHtml?: T extends typeof validTags[number] ? string : never
        ref?: Ref<T | unknown>
        children?: ElementChildren
    }

    type DOMTokenListAttribute = string | string[]

    interface InherentHTMLAttributes {
        // todo
    }

    type BooleanableHTMLProps<Props> = {
        [K in keyof Props]: boolean | Props[K]
    }

    type HTMLAttributes<E, T> = BooleanableHTMLProps<E> & InherentProps<T>

    type Props<T> = T extends HTMLElement ? T & InherentProps<T> : InherentProps<T>

    type VirtualElementTypeType = 'component' | typeof validTags[number] | typeof voidElements[number]

    interface VirtualElementInterface<T extends VirtualElementTypeType = VirtualElementTypeType, P = Props<T>> {
        type: T;
        props: P;
        function: T extends 'component' ? JSXElementConstructor<any> : never
        children?: ElementChildren
    }

    interface FakeVirtualFragmentElement {
        (): (VirtualElementInterface | null);

        type: typeof Fragment
        children: ElementChildren | null
    }
}
