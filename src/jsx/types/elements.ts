import type {HTMLAttributes} from './html-attr'
import type {SVGAttributes} from './svg-attr'
import type VNode from '../VNode'

export interface IntrinsicElements {
    // HTML
    a: HTMLAttributes;
    abbr: HTMLAttributes;
    address: HTMLAttributes;
    area: HTMLAttributes;
    article: HTMLAttributes;
    aside: HTMLAttributes;
    audio: HTMLAttributes;
    b: HTMLAttributes;
    base: HTMLAttributes;
    bdi: HTMLAttributes;
    bdo: HTMLAttributes;
    big: HTMLAttributes;
    blockquote: HTMLAttributes;
    body: HTMLAttributes;
    br: HTMLAttributes;
    button: HTMLAttributes;
    canvas: HTMLAttributes;
    caption: HTMLAttributes;
    cite: HTMLAttributes;
    code: HTMLAttributes;
    col: HTMLAttributes;
    colgroup: HTMLAttributes;
    data: HTMLAttributes;
    datalist: HTMLAttributes;
    dd: HTMLAttributes;
    del: HTMLAttributes;
    details: HTMLAttributes;
    dfn: HTMLAttributes;
    dialog: HTMLAttributes;
    div: HTMLAttributes;
    dl: HTMLAttributes;
    dt: HTMLAttributes;
    em: HTMLAttributes;
    embed: HTMLAttributes;
    fieldset: HTMLAttributes;
    figcaption: HTMLAttributes;
    figure: HTMLAttributes;
    footer: HTMLAttributes;
    form: HTMLAttributes;
    h1: HTMLAttributes;
    h2: HTMLAttributes;
    h3: HTMLAttributes;
    h4: HTMLAttributes;
    h5: HTMLAttributes;
    h6: HTMLAttributes;
    head: HTMLAttributes;
    header: HTMLAttributes;
    hgroup: HTMLAttributes;
    hr: HTMLAttributes;
    html: HTMLAttributes;
    i: HTMLAttributes;
    iframe: HTMLAttributes;
    img: HTMLAttributes;
    input: HTMLAttributes;
    ins: HTMLAttributes;
    kbd: HTMLAttributes;
    keygen: HTMLAttributes;
    label: HTMLAttributes;
    legend: HTMLAttributes;
    li: HTMLAttributes;
    link: HTMLAttributes;
    main: HTMLAttributes;
    map: HTMLAttributes;
    mark: HTMLAttributes;
    marquee: HTMLAttributes;
    menu: HTMLAttributes;
    menuitem: HTMLAttributes;
    meta: HTMLAttributes;
    meter: HTMLAttributes;
    nav: HTMLAttributes;
    noscript: HTMLAttributes;
    object: HTMLAttributes;
    ol: HTMLAttributes;
    optgroup: HTMLAttributes;
    option: HTMLAttributes;
    output: HTMLAttributes;
    p: HTMLAttributes;
    param: HTMLAttributes;
    picture: HTMLAttributes;
    pre: HTMLAttributes;
    progress: HTMLAttributes;
    q: HTMLAttributes;
    rp: HTMLAttributes;
    rt: HTMLAttributes;
    ruby: HTMLAttributes;
    s: HTMLAttributes;
    samp: HTMLAttributes;
    script: HTMLAttributes;
    search: HTMLAttributes;
    section: HTMLAttributes;
    select: HTMLAttributes;
    slot: HTMLAttributes;
    small: HTMLAttributes;
    source: HTMLAttributes;
    span: HTMLAttributes;
    strong: HTMLAttributes;
    style: HTMLAttributes;
    sub: HTMLAttributes;
    summary: HTMLAttributes;
    sup: HTMLAttributes;
    table: HTMLAttributes;
    tbody: HTMLAttributes;
    td: HTMLAttributes;
    textarea: HTMLAttributes;
    tfoot: HTMLAttributes;
    th: HTMLAttributes;
    thead: HTMLAttributes;
    time: HTMLAttributes;
    title: HTMLAttributes;
    tr: HTMLAttributes;
    track: HTMLAttributes;
    u: HTMLAttributes;
    ul: HTMLAttributes;
    var: HTMLAttributes;
    video: HTMLAttributes;
    wbr: HTMLAttributes;

    //SVG
    svg: SVGAttributes;
    animate: SVGAttributes;
    circle: SVGAttributes;
    animateMotion: SVGAttributes;
    animateTransform: SVGAttributes;
    clipPath: SVGAttributes;
    defs: SVGAttributes;
    desc: SVGAttributes;
    ellipse: SVGAttributes;
    feBlend: SVGAttributes;
    feColorMatrix: SVGAttributes;
    feComponentTransfer: SVGAttributes;
    feComposite: SVGAttributes;
    feConvolveMatrix: SVGAttributes;
    feDiffuseLighting: SVGAttributes;
    feDisplacementMap: SVGAttributes;
    feDistantLight: SVGAttributes;
    feDropShadow: SVGAttributes;
    feFlood: SVGAttributes;
    feFuncA: SVGAttributes;
    feFuncB: SVGAttributes;
    feFuncG: SVGAttributes;
    feFuncR: SVGAttributes;
    feGaussianBlur: SVGAttributes;
    feImage: SVGAttributes;
    feMerge: SVGAttributes;
    feMergeNode: SVGAttributes;
    feMorphology: SVGAttributes;
    feOffset: SVGAttributes;
    fePointLight: SVGAttributes;
    feSpecularLighting: SVGAttributes;
    feSpotLight: SVGAttributes;
    feTile: SVGAttributes;
    feTurbulence: SVGAttributes;
    filter: SVGAttributes;
    foreignObject: SVGAttributes;
    g: SVGAttributes;
    image: SVGAttributes;
    line: SVGAttributes;
    linearGradient: SVGAttributes;
    marker: SVGAttributes;
    mask: SVGAttributes;
    metadata: SVGAttributes;
    mpath: SVGAttributes;
    path: SVGAttributes;
    pattern: SVGAttributes;
    polygon: SVGAttributes;
    polyline: SVGAttributes;
    radialGradient: SVGAttributes;
    rect: SVGAttributes;
    set: SVGAttributes;
    stop: SVGAttributes;
    switch: SVGAttributes;
    symbol: SVGAttributes;
    text: SVGAttributes;
    textPath: SVGAttributes;
    tspan: SVGAttributes;
    use: SVGAttributes;
    view: SVGAttributes;
}

export type Element = VNode

export type ComponentChild =
    | VNode<any>
    | object
    | string
    | number
    | bigint
    | boolean
    | null
    | undefined;
export type ComponentChildren = ComponentChild[] | ComponentChild;

export interface FunctionComponent<P = {}> {
    (props: P & Readonly<{children?: ComponentChildren}>): void | any;

    displayName?: string;
    defaultProps?: Partial<P> | undefined;
}

export type ElementType<P = any> =
    | {
    [K in keyof IntrinsicElements]: P extends IntrinsicElements[K]
        ? K
        : never;
}[keyof IntrinsicElements] | FunctionComponent<P>;
