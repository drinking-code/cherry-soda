import {VirtualElement} from "./VirtualElement";

type ComponentType<P = {}> = FunctionComponent<P>;

export interface FunctionComponent<P = {}> {
    (props): VirtualElement | null;

    displayName?: string;
    defaultProps?: Partial<P>;
}

export type ElementChild =
    | VirtualElement
    | object
    | string
    | number
    | bigint
    | boolean
    | null
    | undefined;
