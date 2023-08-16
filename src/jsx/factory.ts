import VNode = JSXInternal.VNode

let vNodeId: number = 0;

function createVNode(type: VNode['type'], props: VNode['props'], key: never, isStaticChildren: unknown, __source: unknown, __self: unknown): VNode<any> {
    // We'll want to preserve `ref` in props to get rid of the need for
    // forwardRef components in the future, but that should happen via
    // a separate PR.
    let normalizedProps = {},
        ref,
        i;
    for (i in props) {
        if (i == 'ref') {
            ref = props[i];
        } else {
            normalizedProps[i] = props[i];
        }
    }

    const vNode = {
        type,
        props: normalizedProps,
        key,
        ref,
        _children: null,
        _parent: null,
        _depth: 0,
        _dom: null,
        _nextDom: undefined,
        _component: null,
        _hydrating: null,
        constructor: undefined,
        _original: --vNodeId,
        __source,
        __self
    };

    // If a Component VNode, check for and apply defaultProps.
    // Note: `type` is often a String, and can be `undefined` in development.
    if (typeof type === 'function' && (ref = type.defaultProps)) {
        for (i in ref)
            if (typeof normalizedProps[i] === 'undefined') {
                normalizedProps[i] = ref[i];
            }
    }

    // if (options.vnode) options.vnode(vNode);
    return vNode;
}

export function Fragment(props) {
    return props.children;
}

export {
    createVNode as jsx,
    createVNode as jsxs,
    createVNode as jsxDEV
};
