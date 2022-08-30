import {VirtualElement} from "./factroy";

type ComponentType<P = {}> = FunctionComponent<P>;

export interface FunctionComponent<P = {}> {
    (props): VirtualElement | null;

    displayName?: string;
    defaultProps?: Partial<P>;
}

export type ComponentChild =
    | VirtualElement
    | object
    | string
    | number
    | bigint
    | boolean
    | null
    | undefined;
export type ComponentChildren = ComponentChild[] | ComponentChild;
