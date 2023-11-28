import {ComponentChild} from '../jsx/types/elements'
import {MinimallyCompatibleNodeData} from './render'
import {JSX} from '../index'

export const renderHooks: Map<RenderHookMatcher, RenderHookCallback> = new Map()

type RenderHookMatcher<V = any> = (value: any) => value is V
type RenderHookCallback<V = any> = (
    value: V,
    render: (child: ComponentChild) => MinimallyCompatibleNodeData | JSX.Element
) => void

export function registerRenderHook<V = any>(match: RenderHookMatcher<V>, callback: RenderHookCallback<V>) {
    renderHooks.set(match, callback)
}
