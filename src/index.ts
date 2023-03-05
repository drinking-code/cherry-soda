// export {default as createState} from './state'
export {default as createRef} from './jsx/create-ref'
export const Fragment = JSX.Fragment
// export {default as Html} from './jsx/dom/builtins/html'
// export {default as Head} from './jsx/dom/builtins/head'
// export {default as Body} from './jsx/dom/builtins/body'

export function doSomething(callback: /*() => void |*/ Function, dependencies: any[] = []) {
}

export function createState<V>(initialValue: V): V {
    return initialValue
}
