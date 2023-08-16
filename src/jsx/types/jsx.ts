// Users who only use Preact for SSR might not specify "dom" in their lib in tsconfig.json
/// <reference lib="dom" />

import {IntrinsicElements as _IntrinsicElements} from './elements'

type Defaultize<Props, Defaults> =
// Distribute over unions
    Props extends any // Make any properties included in Default optional
        ? Partial<Pick<Props, Extract<keyof Props, keyof Defaults>>> & // Include the remaining properties from Props
        Pick<Props, Exclude<keyof Props, keyof Defaults>>
        : never;

export namespace JSXInternal {
    export type LibraryManagedAttributes<Component, Props> = Component extends {
            defaultProps: infer Defaults;
        }
        ? Defaultize<Props, Defaults>
        : Props;

    export interface IntrinsicAttributes {
        key?: any;
    }

    export interface ElementAttributesProperty {
        props: any;
    }

    export interface ElementChildrenAttribute {
        children: any;
    }

    export interface PathAttributes {
        d: string;
    }

    export type IntrinsicElements = _IntrinsicElements
}
