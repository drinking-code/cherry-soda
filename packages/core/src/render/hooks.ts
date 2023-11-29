import {ComponentChild} from '../jsx/types/elements'
import {MinimallyCompatibleNodeData} from './render'
import {JSX} from '../index'

export const renderChildHooks: Map<RenderHookMatcher, RenderHookChildCallback> = new Map()
export const renderPropHooks: Map<RenderHookMatcher, RenderHookPropCallback> = new Map()

export type RenderHookMatcher<V = any> = (value: any) => value is V
export type RenderHookChildCallback<V = any> = (
    value: V,
    render: (child: ComponentChild) => MinimallyCompatibleNodeData | JSX.Element
) => boolean | void
export type RenderHookPropCallback<V = any> = (
    value: V,
    setProp: (prop: string | number | boolean) => void,
    ctx: {
        node: JSX.Element,
        key: string,
    }
) => boolean | void

export function registerRenderHook<V = any>(match: RenderHookMatcher<V>, renderChild: RenderHookChildCallback<V>, renderProp?: RenderHookPropCallback<V>) {
    renderChildHooks.set(match, renderChild)
    renderProp && renderPropHooks.set(match, renderProp)
}
