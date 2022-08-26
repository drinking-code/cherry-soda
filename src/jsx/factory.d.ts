export interface VirtualElementType<P = {}> {
    type: ComponentType<P> | string;
    props: P & { children: ComponentChildren };
    key: Key;
    ref?: Ref<any> | null;
}

type ComponentType<P = {}> = FunctionComponent<P>;

export interface FunctionComponent<P = {}> {
    (props): VirtualElementType<any> | null;

    displayName?: string;
    defaultProps?: Partial<P>;
}

export type ComponentChild =
    | VirtualElementType<any>
    | object
    | string
    | number
    | bigint
    | boolean
    | null
    | undefined;
export type ComponentChildren = ComponentChild[] | ComponentChild;

export type Key = string | number | any;

export type RefObject<T> = { current: T | null };
export type RefCallback<T> = (instance: T | null) => void;
export type Ref<T> = RefObject<T> | RefCallback<T>;
