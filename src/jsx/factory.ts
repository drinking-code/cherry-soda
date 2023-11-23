import VNode from './VNode'

export function createElement(type: VNode['type'], props: VNode['props']) {
    return new VNode(type, props)
}

export const Fragment = Symbol.for('Fragment')

export {
    createElement as jsx,
    createElement as jsxs,
    createElement as jsxDEV
}
