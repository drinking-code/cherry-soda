import type {AriaAttributes, AriaRole} from './aria'
import type {DOMAttributes} from './event-handler-attr'

export interface CSAttributes {
    ref?: string;
}

export type DOMCSSProperties = {
    [key in keyof Omit<
        CSSStyleDeclaration,
        | 'item'
        | 'setProperty'
        | 'removeProperty'
        | 'getPropertyValue'
        | 'getPropertyPriority'
    >]?: string | number | null | undefined;
};
export type AllCSSProperties = {
    [key: string]: string | number | null | undefined;
};

export interface CSSProperties extends AllCSSProperties, DOMCSSProperties {
    cssText?: string | null;
}

export interface HTMLAttributes<Target extends EventTarget = EventTarget>
    extends CSAttributes, DOMAttributes<Target>, AriaAttributes {
    // Standard HTML Attributes
    accept?: string | undefined;
    acceptCharset?: string | undefined;
    accessKey?: string | undefined;
    action?: string | undefined;
    allow?: string | undefined;
    allowFullScreen?: boolean | undefined;
    allowTransparency?: boolean | undefined;
    alt?: string | undefined;
    as?: string | undefined;
    async?: boolean | undefined;
    autocomplete?: string | undefined;
    autoComplete?: string | undefined;
    autocorrect?: string | undefined;
    autoCorrect?: string | undefined;
    autofocus?: boolean | undefined;
    autoFocus?: boolean | undefined;
    autoPlay?: boolean | undefined;
    capture?: boolean | string | undefined;
    cellPadding?: number | string | undefined;
    cellSpacing?: number | string | undefined;
    charSet?: string | undefined;
    challenge?: string | undefined;
    checked?: boolean | undefined;
    cite?: string | undefined;
    // class?: string | undefined;
    className?: string | undefined;
    cols?: number | undefined;
    colSpan?: number | undefined;
    content?: string | undefined;
    contentEditable?: boolean | undefined;
    contextMenu?: string | undefined;
    controls?: boolean | undefined;
    controlsList?: string | undefined;
    coords?: string | undefined;
    crossOrigin?: string | undefined;
    data?: string | undefined;
    dateTime?: string | undefined;
    default?: boolean | undefined;
    defaultChecked?: boolean | undefined;
    defaultValue?: string | undefined;
    defer?: boolean | undefined;
    dir?:
        | 'auto'
        | 'rtl'
        | 'ltr'
        | undefined;
    disabled?: boolean | undefined;
    disableRemotePlayback?:
        | boolean
        | undefined;
    download?: any | undefined;
    decoding?:
        | 'sync'
        | 'async'
        | 'auto'
        | undefined;
    draggable?: boolean | undefined;
    encType?: string | undefined;
    enterkeyhint?:
        | 'enter'
        | 'done'
        | 'go'
        | 'next'
        | 'previous'
        | 'search'
        | 'send'
        | undefined;
    for?: string | undefined;
    form?: string | undefined;
    formAction?: string | undefined;
    formEncType?: string | undefined;
    formMethod?: string | undefined;
    formNoValidate?: boolean | undefined;
    formTarget?: string | undefined;
    frameBorder?:
        | number
        | string
        | undefined;
    headers?: string | undefined;
    height?:
        | number
        | string
        | undefined;
    hidden?:
        | boolean
        | 'hidden'
        | 'until-found'
        | undefined;
    high?: number | undefined;
    href?: string | undefined;
    hrefLang?: string | undefined;
    htmlFor?: string | undefined;
    httpEquiv?: string | undefined;
    icon?: string | undefined;
    id?: string | undefined;
    indeterminate?: boolean | undefined;
    inert?: boolean | undefined;
    inputMode?: string | undefined;
    integrity?: string | undefined;
    is?: string | undefined;
    keyParams?: string | undefined;
    keyType?: string | undefined;
    kind?: string | undefined;
    label?: string | undefined;
    lang?: string | undefined;
    list?: string | undefined;
    loading?:
        | 'eager'
        | 'lazy'
        | undefined;
    loop?: boolean | undefined;
    low?: number | undefined;
    manifest?: string | undefined;
    marginHeight?: number | undefined;
    marginWidth?: number | undefined;
    max?: number | string | undefined;
    maxLength?: number | undefined;
    media?: string | undefined;
    mediaGroup?: string | undefined;
    method?: string | undefined;
    min?: number | string | undefined;
    minLength?: number | undefined;
    multiple?: boolean | undefined;
    muted?: boolean | undefined;
    name?: string | undefined;
    nomodule?: boolean | undefined;
    nonce?: string | undefined;
    noValidate?: boolean | undefined;
    open?: boolean | undefined;
    optimum?: number | undefined;
    part?: string | undefined;
    pattern?: string | undefined;
    ping?: string | undefined;
    placeholder?: string | undefined;
    playsInline?: boolean | undefined;
    poster?: string | undefined;
    preload?: string | undefined;
    radioGroup?: string | undefined;
    readonly?: boolean | undefined;
    readOnly?: boolean | undefined;
    referrerpolicy?:
        | 'no-referrer'
        | 'no-referrer-when-downgrade'
        | 'origin'
        | 'origin-when-cross-origin'
        | 'same-origin'
        | 'strict-origin'
        | 'strict-origin-when-cross-origin'
        | 'unsafe-url'
        | undefined;
    rel?: string | undefined;
    required?: boolean | undefined;
    reversed?: boolean | undefined;
    role?: AriaRole | undefined;
    rows?: number | undefined;
    rowSpan?: number | undefined;
    sandbox?: string | undefined;
    scope?: string | undefined;
    scoped?: boolean | undefined;
    scrolling?: string | undefined;
    seamless?: boolean | undefined;
    selected?: boolean | undefined;
    shape?: string | undefined;
    size?: number | undefined;
    sizes?: string | undefined;
    slot?: string | undefined;
    span?: number | undefined;
    spellcheck?: boolean | undefined;
    spellCheck?: boolean | undefined;
    src?: string | undefined;
    srcset?: string | undefined;
    srcDoc?: string | undefined;
    srcLang?: string | undefined;
    srcSet?: string | undefined;
    start?: number | undefined;
    step?:
        | number
        | string
        | undefined;
    style?:
        | string
        | CSSProperties
        | undefined;
    summary?: string | undefined;
    tabIndex?: number | undefined;
    target?: string | undefined;
    title?: string | undefined;
    type?: string | undefined;
    useMap?: string | undefined;
    value?:
        | string
        | string[]
        | number
        | undefined;
    volume?:
        | string
        | number
        | undefined;
    width?:
        | number
        | string
        | undefined;
    wmode?: string | undefined;
    wrap?: string | undefined;

    // Non-standard Attributes
    autocapitalize?:
        | 'off'
        | 'none'
        | 'on'
        | 'sentences'
        | 'words'
        | 'characters'
        | undefined;
    autoCapitalize?:
        | 'off'
        | 'none'
        | 'on'
        | 'sentences'
        | 'words'
        | 'characters'
        | undefined;
    disablePictureInPicture?:
        | boolean
        | undefined;
    results?: number | undefined;
    translate?: 'yes' | 'no' | undefined;

    // RDFa Attributes
    about?: string | undefined;
    datatype?: string | undefined;
    inlist?: any;
    prefix?: string | undefined;
    property?: string | undefined;
    resource?: string | undefined;
    typeof?: string | undefined;
    vocab?: string | undefined;

    // Microdata Attributes
    itemProp?: string | undefined;
    itemScope?: boolean | undefined;
    itemType?: string | undefined;
    itemID?: string | undefined;
    itemRef?: string | undefined;
}

export type DetailedHTMLProps<
    HA extends HTMLAttributes<RefType>,
    RefType extends EventTarget = EventTarget
> = HA;
