import type {ComponentChildren} from './elements'
import type {
    AnimationEventHandler,
    ClipboardEventHandler,
    CompositionEventHandler,
    DragEventHandler,
    FocusEventHandler,
    GenericEventHandler,
    KeyboardEventHandler,
    MouseEventHandler, PictureInPictureEventHandler,
    PointerEventHandler,
    TouchEventHandler,
    TransitionEventHandler,
    UIEventHandler,
    WheelEventHandler
} from './events'

export interface DOMAttributes {
    children?: ComponentChildren;
    dangerouslySetInnerHTML?: {
        __html: string;
    };
}

export enum DOMEvents {
    // Image Events
    load = 'load',
    error = 'error',

    // Clipboard Events
    copy = 'copy',
    cut = 'cut',
    paste = 'paste',

    // Composition Events
    compositionEnd = 'compositionEnd',
    compositionStart = 'compositionStart',
    compositionUpdate = 'compositionUpdate',

    // Details Events
    toggle = 'toggle',

    // Dialog Events
    close = 'close',
    cancel = 'cancel',

    // Focus Events
    focus = 'focus',
    focusin = 'focusin',
    focusout = 'focusout',
    blur = 'blur',

    // Form Events
    change = 'change',
    input = 'input',
    beforeInput = 'beforeInput',
    search = 'search',
    submit = 'submit',
    invalid = 'invalid',
    reset = 'reset',
    formData = 'formData',

    // Keyboard Events
    keyDown = 'keyDown',
    keyPress = 'keyPress',
    keyUp = 'keyUp',

    // Media Events
    abort = 'abort',
    canPlay = 'canPlay',
    canPlayThrough = 'canPlayThrough',
    durationChange = 'durationChange',
    emptied = 'emptied',
    encrypted = 'encrypted',
    ended = 'ended',
    loadedData = 'loadedData',
    loadedMetadata = 'loadedMetadata',
    loadStart = 'loadStart',
    pause = 'pause',
    play = 'play',
    playing = 'playing',
    progress = 'progress',
    rateChange = 'rateChange',
    seeked = 'seeked',
    seeking = 'seeking',
    stalled = 'stalled',
    suspend = 'suspend',
    timeUpdate = 'timeUpdate',
    volumeChange = 'volumeChange',
    waiting = 'waiting',

    // MouseEvents
    click = 'click',
    contextMenu = 'contextMenu',
    dblClick = 'dblClick',
    drag = 'drag',
    dragEnd = 'dragEnd',
    dragEnter = 'dragEnter',
    dragExit = 'dragExit',
    dragLeave = 'dragLeave',
    dragOver = 'dragOver',
    dragStart = 'dragStart',
    drop = 'drop',
    mouseDown = 'mouseDown',
    mouseEnter = 'mouseEnter',
    mouseLeave = 'mouseLeave',
    mouseMove = 'mouseMove',
    mouseOut = 'mouseOut',
    mouseOver = 'mouseOver',
    mouseUp = 'mouseUp',

    // Selection Events
    select = 'select',

    // Touch Events
    touchCancel = 'touchCancel',
    touchEnd = 'touchEnd',
    touchMove = 'touchMove',
    touchStart = 'touchStart',

    // Pointer Events
    pointerOver = 'pointerOver',
    pointerEnter = 'pointerEnter',
    pointerDown = 'pointerDown',
    pointerMove = 'pointerMove',
    pointerUp = 'pointerUp',
    pointerCancel = 'pointerCancel',
    pointerOut = 'pointerOut',
    pointerLeave = 'pointerLeave',
    gotPointerCapture = 'gotPointerCapture',
    lostPointerCapture = 'lostPointerCapture',

    // UI Events
    scroll = 'scroll',

    // Wheel Events
    wheel = 'wheel',

    // Animation Events
    animationStart = 'animationStart',
    animationEnd = 'animationEnd',
    animationIteration = 'animationIteration',

    // Transition Events
    transitionCancel = 'transitionCancel',
    transitionEnd = 'transitionEnd',
    transitionRun = 'transitionRun',
    transitionStart = 'transitionStart',

    // PictureInPicture Events
    enterPictureInPicture = 'enterPictureInPicture',
    leavePictureInPicture = 'leavePictureInPicture',
    resize = 'resize',
}

export type DOMEventHandler<Event extends DOMEvents, Target extends EventTarget> = DOMEventHandlers<Target>[Event]

export interface DOMEventHandlers<Target extends EventTarget> {
    // Image Events
    [DOMEvents.load]: GenericEventHandler<Target>;
    [DOMEvents.error]: GenericEventHandler<Target>;

    // Clipboard Events
    [DOMEvents.copy]: ClipboardEventHandler<Target>;
    [DOMEvents.cut]: ClipboardEventHandler<Target>;
    [DOMEvents.paste]: ClipboardEventHandler<Target>;

    // Composition Events
    [DOMEvents.compositionEnd]: CompositionEventHandler<Target>;
    [DOMEvents.compositionStart]: CompositionEventHandler<Target>;
    [DOMEvents.compositionUpdate]: CompositionEventHandler<Target>;

    // Details Events
    [DOMEvents.toggle]: GenericEventHandler<Target>;

    // Dialog Events
    [DOMEvents.close]: GenericEventHandler<Target>;
    [DOMEvents.cancel]: GenericEventHandler<Target>;

    // Focus Events
    [DOMEvents.focus]: FocusEventHandler<Target>;
    [DOMEvents.focusin]: FocusEventHandler<Target>;
    [DOMEvents.focusout]: FocusEventHandler<Target>;
    [DOMEvents.blur]: FocusEventHandler<Target>;

    // Form Events
    [DOMEvents.change]: GenericEventHandler<Target>;
    [DOMEvents.input]: GenericEventHandler<Target>;
    [DOMEvents.beforeInput]: GenericEventHandler<Target>;
    [DOMEvents.search]: GenericEventHandler<Target>;
    [DOMEvents.submit]: GenericEventHandler<Target>;
    [DOMEvents.invalid]: GenericEventHandler<Target>;
    [DOMEvents.reset]: GenericEventHandler<Target>;
    [DOMEvents.formData]: GenericEventHandler<Target>;

    // Keyboard Events
    [DOMEvents.keyDown]: KeyboardEventHandler<Target>;
    [DOMEvents.keyPress]: KeyboardEventHandler<Target>;
    [DOMEvents.keyUp]: KeyboardEventHandler<Target>;

    // Media Events
    [DOMEvents.abort]: GenericEventHandler<Target>;
    [DOMEvents.canPlay]: GenericEventHandler<Target>;
    [DOMEvents.canPlayThrough]: GenericEventHandler<Target>;
    [DOMEvents.durationChange]: GenericEventHandler<Target>;
    [DOMEvents.emptied]: GenericEventHandler<Target>;
    [DOMEvents.encrypted]: GenericEventHandler<Target>;
    [DOMEvents.ended]: GenericEventHandler<Target>;
    [DOMEvents.loadedData]: GenericEventHandler<Target>;
    [DOMEvents.loadedMetadata]: GenericEventHandler<Target>;
    [DOMEvents.loadStart]: GenericEventHandler<Target>;
    [DOMEvents.pause]: GenericEventHandler<Target>;
    [DOMEvents.play]: GenericEventHandler<Target>;
    [DOMEvents.playing]: GenericEventHandler<Target>;
    [DOMEvents.progress]: GenericEventHandler<Target>;
    [DOMEvents.rateChange]: GenericEventHandler<Target>;
    [DOMEvents.seeked]: GenericEventHandler<Target>;
    [DOMEvents.seeking]: GenericEventHandler<Target>;
    [DOMEvents.stalled]: GenericEventHandler<Target>;
    [DOMEvents.suspend]: GenericEventHandler<Target>;
    [DOMEvents.timeUpdate]: GenericEventHandler<Target>;
    [DOMEvents.volumeChange]: GenericEventHandler<Target>;
    [DOMEvents.waiting]: GenericEventHandler<Target>;

    // MouseEvents
    [DOMEvents.click]: MouseEventHandler<Target>;
    [DOMEvents.contextMenu]: MouseEventHandler<Target>;
    [DOMEvents.dblClick]: MouseEventHandler<Target>;
    [DOMEvents.drag]: DragEventHandler<Target>;
    [DOMEvents.dragEnd]: DragEventHandler<Target>;
    [DOMEvents.dragEnter]: DragEventHandler<Target>;
    [DOMEvents.dragExit]: DragEventHandler<Target>;
    [DOMEvents.dragLeave]: DragEventHandler<Target>;
    [DOMEvents.dragOver]: DragEventHandler<Target>;
    [DOMEvents.dragStart]: DragEventHandler<Target>;
    [DOMEvents.drop]: DragEventHandler<Target>;
    [DOMEvents.mouseDown]: MouseEventHandler<Target>;
    [DOMEvents.mouseEnter]: MouseEventHandler<Target>;
    [DOMEvents.mouseLeave]: MouseEventHandler<Target>;
    [DOMEvents.mouseMove]: MouseEventHandler<Target>;
    [DOMEvents.mouseOut]: MouseEventHandler<Target>;
    [DOMEvents.mouseOver]: MouseEventHandler<Target>;
    [DOMEvents.mouseUp]: MouseEventHandler<Target>;

    // Selection Events
    [DOMEvents.select]: GenericEventHandler<Target>;

    // Touch Events
    [DOMEvents.touchCancel]: TouchEventHandler<Target>;
    [DOMEvents.touchEnd]: TouchEventHandler<Target>;
    [DOMEvents.touchMove]: TouchEventHandler<Target>;
    [DOMEvents.touchStart]: TouchEventHandler<Target>;

    // Pointer Events
    [DOMEvents.pointerOver]: PointerEventHandler<Target>;
    [DOMEvents.pointerEnter]: PointerEventHandler<Target>;
    [DOMEvents.pointerDown]: PointerEventHandler<Target>;
    [DOMEvents.pointerMove]: PointerEventHandler<Target>;
    [DOMEvents.pointerUp]: PointerEventHandler<Target>;
    [DOMEvents.pointerCancel]: PointerEventHandler<Target>;
    [DOMEvents.pointerOut]: PointerEventHandler<Target>;
    [DOMEvents.pointerLeave]: PointerEventHandler<Target>;
    [DOMEvents.gotPointerCapture]: PointerEventHandler<Target>;
    [DOMEvents.lostPointerCapture]: PointerEventHandler<Target>;

    // UI Events
    [DOMEvents.scroll]: UIEventHandler<Target>;

    // Wheel Events
    [DOMEvents.wheel]: WheelEventHandler<Target>;

    // Animation Events
    [DOMEvents.animationStart]: AnimationEventHandler<Target>;
    [DOMEvents.animationEnd]: AnimationEventHandler<Target>;
    [DOMEvents.animationIteration]: AnimationEventHandler<Target>;

    // Transition Events
    [DOMEvents.transitionCancel]: TransitionEventHandler<Target>;
    [DOMEvents.transitionEnd]: TransitionEventHandler<Target>;
    [DOMEvents.transitionRun]: TransitionEventHandler<Target>;
    [DOMEvents.transitionStart]: TransitionEventHandler<Target>;

    // PictureInPicture Events
    [DOMEvents.enterPictureInPicture]: PictureInPictureEventHandler<Target>;
    [DOMEvents.leavePictureInPicture]: PictureInPictureEventHandler<Target>;
    [DOMEvents.resize]: PictureInPictureEventHandler<Target>;
}
