import VNode from './VNode'

function createVNode(type: VNode['type'], props: VNode['props'], key?: never, isStaticChildren?: unknown, __source?: unknown, __self?: unknown) {
    return new VNode(type, props, __source, __self)
}

export const Fragment = Symbol.for('Fragment')

export {
    createVNode as jsx,
    createVNode as jsxs,
    createVNode as jsxDEV
}
