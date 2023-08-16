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

export interface PreactDOMAttributes {
    children?: ComponentChildren;
    dangerouslySetInnerHTML?: {
        __html: string;
    };
}

export interface DOMAttributes<Target extends EventTarget> extends PreactDOMAttributes {
    // Image Events
    onLoad?: GenericEventHandler<Target> | undefined;
    onLoadCapture?: GenericEventHandler<Target> | undefined;
    onError?: GenericEventHandler<Target> | undefined;
    onErrorCapture?: GenericEventHandler<Target> | undefined;

    // Clipboard Events
    onCopy?: ClipboardEventHandler<Target> | undefined;
    onCopyCapture?: ClipboardEventHandler<Target> | undefined;
    onCut?: ClipboardEventHandler<Target> | undefined;
    onCutCapture?: ClipboardEventHandler<Target> | undefined;
    onPaste?: ClipboardEventHandler<Target> | undefined;
    onPasteCapture?: ClipboardEventHandler<Target> | undefined;

    // Composition Events
    onCompositionEnd?: CompositionEventHandler<Target> | undefined;
    onCompositionEndCapture?: CompositionEventHandler<Target> | undefined;
    onCompositionStart?: CompositionEventHandler<Target> | undefined;
    onCompositionStartCapture?: CompositionEventHandler<Target> | undefined;
    onCompositionUpdate?: CompositionEventHandler<Target> | undefined;
    onCompositionUpdateCapture?: CompositionEventHandler<Target> | undefined;

    // Details Events
    onToggle?: GenericEventHandler<Target> | undefined;

    // Dialog Events
    onClose?: GenericEventHandler<Target> | undefined;
    onCancel?: GenericEventHandler<Target> | undefined;

    // Focus Events
    onFocus?: FocusEventHandler<Target> | undefined;
    onFocusCapture?: FocusEventHandler<Target> | undefined;
    onfocusin?: FocusEventHandler<Target> | undefined;
    onfocusinCapture?: FocusEventHandler<Target> | undefined;
    onfocusout?: FocusEventHandler<Target> | undefined;
    onfocusoutCapture?: FocusEventHandler<Target> | undefined;
    onBlur?: FocusEventHandler<Target> | undefined;
    onBlurCapture?: FocusEventHandler<Target> | undefined;

    // Form Events
    onChange?: GenericEventHandler<Target> | undefined;
    onChangeCapture?: GenericEventHandler<Target> | undefined;
    onInput?: GenericEventHandler<Target> | undefined;
    onInputCapture?: GenericEventHandler<Target> | undefined;
    onBeforeInput?: GenericEventHandler<Target> | undefined;
    onBeforeInputCapture?: GenericEventHandler<Target> | undefined;
    onSearch?: GenericEventHandler<Target> | undefined;
    onSearchCapture?: GenericEventHandler<Target> | undefined;
    onSubmit?: GenericEventHandler<Target> | undefined;
    onSubmitCapture?: GenericEventHandler<Target> | undefined;
    onInvalid?: GenericEventHandler<Target> | undefined;
    onInvalidCapture?: GenericEventHandler<Target> | undefined;
    onReset?: GenericEventHandler<Target> | undefined;
    onResetCapture?: GenericEventHandler<Target> | undefined;
    onFormData?: GenericEventHandler<Target> | undefined;
    onFormDataCapture?: GenericEventHandler<Target> | undefined;

    // Keyboard Events
    onKeyDown?: KeyboardEventHandler<Target> | undefined;
    onKeyDownCapture?: KeyboardEventHandler<Target> | undefined;
    onKeyPress?: KeyboardEventHandler<Target> | undefined;
    onKeyPressCapture?: KeyboardEventHandler<Target> | undefined;
    onKeyUp?: KeyboardEventHandler<Target> | undefined;
    onKeyUpCapture?: KeyboardEventHandler<Target> | undefined;

    // Media Events
    onAbort?: GenericEventHandler<Target> | undefined;
    onAbortCapture?: GenericEventHandler<Target> | undefined;
    onCanPlay?: GenericEventHandler<Target> | undefined;
    onCanPlayCapture?: GenericEventHandler<Target> | undefined;
    onCanPlayThrough?: GenericEventHandler<Target> | undefined;
    onCanPlayThroughCapture?: GenericEventHandler<Target> | undefined;
    onDurationChange?: GenericEventHandler<Target> | undefined;
    onDurationChangeCapture?: GenericEventHandler<Target> | undefined;
    onEmptied?: GenericEventHandler<Target> | undefined;
    onEmptiedCapture?: GenericEventHandler<Target> | undefined;
    onEncrypted?: GenericEventHandler<Target> | undefined;
    onEncryptedCapture?: GenericEventHandler<Target> | undefined;
    onEnded?: GenericEventHandler<Target> | undefined;
    onEndedCapture?: GenericEventHandler<Target> | undefined;
    onLoadedData?: GenericEventHandler<Target> | undefined;
    onLoadedDataCapture?: GenericEventHandler<Target> | undefined;
    onLoadedMetadata?: GenericEventHandler<Target> | undefined;
    onLoadedMetadataCapture?: GenericEventHandler<Target> | undefined;
    onLoadStart?: GenericEventHandler<Target> | undefined;
    onLoadStartCapture?: GenericEventHandler<Target> | undefined;
    onPause?: GenericEventHandler<Target> | undefined;
    onPauseCapture?: GenericEventHandler<Target> | undefined;
    onPlay?: GenericEventHandler<Target> | undefined;
    onPlayCapture?: GenericEventHandler<Target> | undefined;
    onPlaying?: GenericEventHandler<Target> | undefined;
    onPlayingCapture?: GenericEventHandler<Target> | undefined;
    onProgress?: GenericEventHandler<Target> | undefined;
    onProgressCapture?: GenericEventHandler<Target> | undefined;
    onRateChange?: GenericEventHandler<Target> | undefined;
    onRateChangeCapture?: GenericEventHandler<Target> | undefined;
    onSeeked?: GenericEventHandler<Target> | undefined;
    onSeekedCapture?: GenericEventHandler<Target> | undefined;
    onSeeking?: GenericEventHandler<Target> | undefined;
    onSeekingCapture?: GenericEventHandler<Target> | undefined;
    onStalled?: GenericEventHandler<Target> | undefined;
    onStalledCapture?: GenericEventHandler<Target> | undefined;
    onSuspend?: GenericEventHandler<Target> | undefined;
    onSuspendCapture?: GenericEventHandler<Target> | undefined;
    onTimeUpdate?: GenericEventHandler<Target> | undefined;
    onTimeUpdateCapture?: GenericEventHandler<Target> | undefined;
    onVolumeChange?: GenericEventHandler<Target> | undefined;
    onVolumeChangeCapture?: GenericEventHandler<Target> | undefined;
    onWaiting?: GenericEventHandler<Target> | undefined;
    onWaitingCapture?: GenericEventHandler<Target> | undefined;

    // MouseEvents
    onClick?: MouseEventHandler<Target> | undefined;
    onClickCapture?: MouseEventHandler<Target> | undefined;
    onContextMenu?: MouseEventHandler<Target> | undefined;
    onContextMenuCapture?: MouseEventHandler<Target> | undefined;
    onDblClick?: MouseEventHandler<Target> | undefined;
    onDblClickCapture?: MouseEventHandler<Target> | undefined;
    onDrag?: DragEventHandler<Target> | undefined;
    onDragCapture?: DragEventHandler<Target> | undefined;
    onDragEnd?: DragEventHandler<Target> | undefined;
    onDragEndCapture?: DragEventHandler<Target> | undefined;
    onDragEnter?: DragEventHandler<Target> | undefined;
    onDragEnterCapture?: DragEventHandler<Target> | undefined;
    onDragExit?: DragEventHandler<Target> | undefined;
    onDragExitCapture?: DragEventHandler<Target> | undefined;
    onDragLeave?: DragEventHandler<Target> | undefined;
    onDragLeaveCapture?: DragEventHandler<Target> | undefined;
    onDragOver?: DragEventHandler<Target> | undefined;
    onDragOverCapture?: DragEventHandler<Target> | undefined;
    onDragStart?: DragEventHandler<Target> | undefined;
    onDragStartCapture?: DragEventHandler<Target> | undefined;
    onDrop?: DragEventHandler<Target> | undefined;
    onDropCapture?: DragEventHandler<Target> | undefined;
    onMouseDown?: MouseEventHandler<Target> | undefined;
    onMouseDownCapture?: MouseEventHandler<Target> | undefined;
    onMouseEnter?: MouseEventHandler<Target> | undefined;
    onMouseEnterCapture?: MouseEventHandler<Target> | undefined;
    onMouseLeave?: MouseEventHandler<Target> | undefined;
    onMouseLeaveCapture?: MouseEventHandler<Target> | undefined;
    onMouseMove?: MouseEventHandler<Target> | undefined;
    onMouseMoveCapture?: MouseEventHandler<Target> | undefined;
    onMouseOut?: MouseEventHandler<Target> | undefined;
    onMouseOutCapture?: MouseEventHandler<Target> | undefined;
    onMouseOver?: MouseEventHandler<Target> | undefined;
    onMouseOverCapture?: MouseEventHandler<Target> | undefined;
    onMouseUp?: MouseEventHandler<Target> | undefined;
    onMouseUpCapture?: MouseEventHandler<Target> | undefined;

    // Selection Events
    onSelect?: GenericEventHandler<Target> | undefined;
    onSelectCapture?: GenericEventHandler<Target> | undefined;

    // Touch Events
    onTouchCancel?: TouchEventHandler<Target> | undefined;
    onTouchCancelCapture?: TouchEventHandler<Target> | undefined;
    onTouchEnd?: TouchEventHandler<Target> | undefined;
    onTouchEndCapture?: TouchEventHandler<Target> | undefined;
    onTouchMove?: TouchEventHandler<Target> | undefined;
    onTouchMoveCapture?: TouchEventHandler<Target> | undefined;
    onTouchStart?: TouchEventHandler<Target> | undefined;
    onTouchStartCapture?: TouchEventHandler<Target> | undefined;

    // Pointer Events
    onPointerOver?: PointerEventHandler<Target> | undefined;
    onPointerOverCapture?: PointerEventHandler<Target> | undefined;
    onPointerEnter?: PointerEventHandler<Target> | undefined;
    onPointerEnterCapture?: PointerEventHandler<Target> | undefined;
    onPointerDown?: PointerEventHandler<Target> | undefined;
    onPointerDownCapture?: PointerEventHandler<Target> | undefined;
    onPointerMove?: PointerEventHandler<Target> | undefined;
    onPointerMoveCapture?: PointerEventHandler<Target> | undefined;
    onPointerUp?: PointerEventHandler<Target> | undefined;
    onPointerUpCapture?: PointerEventHandler<Target> | undefined;
    onPointerCancel?: PointerEventHandler<Target> | undefined;
    onPointerCancelCapture?: PointerEventHandler<Target> | undefined;
    onPointerOut?: PointerEventHandler<Target> | undefined;
    onPointerOutCapture?: PointerEventHandler<Target> | undefined;
    onPointerLeave?: PointerEventHandler<Target> | undefined;
    onPointerLeaveCapture?: PointerEventHandler<Target> | undefined;
    onGotPointerCapture?: PointerEventHandler<Target> | undefined;
    onGotPointerCaptureCapture?: PointerEventHandler<Target> | undefined;
    onLostPointerCapture?: PointerEventHandler<Target> | undefined;
    onLostPointerCaptureCapture?: PointerEventHandler<Target> | undefined;

    // UI Events
    onScroll?: UIEventHandler<Target> | undefined;
    onScrollCapture?: UIEventHandler<Target> | undefined;

    // Wheel Events
    onWheel?: WheelEventHandler<Target> | undefined;
    onWheelCapture?: WheelEventHandler<Target> | undefined;

    // Animation Events
    onAnimationStart?: AnimationEventHandler<Target> | undefined;
    onAnimationStartCapture?: AnimationEventHandler<Target> | undefined;
    onAnimationEnd?: AnimationEventHandler<Target> | undefined;
    onAnimationEndCapture?: AnimationEventHandler<Target> | undefined;
    onAnimationIteration?: AnimationEventHandler<Target> | undefined;
    onAnimationIterationCapture?: AnimationEventHandler<Target> | undefined;

    // Transition Events
    onTransitionCancel?: TransitionEventHandler<Target>;
    onTransitionCancelCapture?: TransitionEventHandler<Target>;
    onTransitionEnd?: TransitionEventHandler<Target>;
    onTransitionEndCapture?: TransitionEventHandler<Target>;
    onTransitionRun?: TransitionEventHandler<Target>;
    onTransitionRunCapture?: TransitionEventHandler<Target>;
    onTransitionStart?: TransitionEventHandler<Target>;
    onTransitionStartCapture?: TransitionEventHandler<Target>;

    // PictureInPicture Events
    onEnterPictureInPicture?: PictureInPictureEventHandler<Target>;
    onEnterPictureInPictureCapture?: PictureInPictureEventHandler<Target>;
    onLeavePictureInPicture?: PictureInPictureEventHandler<Target>;
    onLeavePictureInPictureCapture?: PictureInPictureEventHandler<Target>;
    onResize?: PictureInPictureEventHandler<Target>;
    onResizeCapture?: PictureInPictureEventHandler<Target>;
}
