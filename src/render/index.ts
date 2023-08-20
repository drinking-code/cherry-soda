import {type JSX} from '../index'
import {_render} from './render'

export function render(node: JSX.Element): void {
    _render(node, true)
}

export function mount(node: JSX.Element, to: HTMLElement): void {
    node._dom = to
    render(node)
}
