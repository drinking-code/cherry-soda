export {JSXInternal as JSX} from './jsx/types/jsx'
export {Fragment, createElement} from './jsx/factory'

export {defineDom, mount} from './render'
export {registerRenderHook} from './render/hooks'

export {default as Identifiable} from './utils/Identifiable'
export {isVNode as isElement} from './jsx/VNode'

export type {RenderHookMatcher, RenderHookChildCallback, RenderHookPropCallback} from './render/hooks'
