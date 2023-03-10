export {createState} from './state/state'
export {default as createRef} from './jsx/create-ref'
export {Fragment} from './jsx/factory'
export {default as Html} from './jsx/dom/builtins/html'
export {default as Head} from './jsx/dom/builtins/head'
export {default as Body} from './jsx/dom/builtins/body'

export function doSomething(callback: /*() => void |*/ Function, dependencies: any[] = []) {
}
