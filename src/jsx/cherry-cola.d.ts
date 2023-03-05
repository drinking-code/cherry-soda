import {validTags, voidElements} from './dom/html-props'
import {ElementChildren} from './ElementChildren'
import {Fragment} from '#cherry-cola'
import {Ref} from './create-ref'

export = CherryCola;
export as namespace CherryCola;

declare namespace CherryCola {
    type JSXElementConstructor<P> = (props: P) => VirtualElement | ElementChildren | null

    interface InherentProps<T> {
        unsafeInnerHtml?: T extends typeof validTags[number] ? string : never
        ref?: Ref<T | unknown>
    }

    type DOMTokenListAttribute = string | string[]

    interface InherentHTMLAttributes {
        // todo
    }

    type HTMLAttributes<E, T> = E & InherentProps<T>

    type Props<T> = T & InherentProps<T>

    interface VirtualElement<T = 'component' | typeof validTags[number] | typeof voidElements[number], P = Props<T>> {
        type: T;
        props: P;
        function: T extends 'component' ? JSXElementConstructor<any> : never
        children?: ElementChildren
    }

    interface FakeVirtualFragmentElement {
        (): (VirtualElement | null);

        type: typeof Fragment
        children: ElementChildren | null
    }
}
