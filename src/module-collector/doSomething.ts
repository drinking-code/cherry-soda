export default function doSomething(callback: Function, parameters: Array<any>): void {
    console.log(callback.toString())
    console.log(parameters)
    // todo: turn states into [state, setState]
    // todo: serialize complex parameters (such as imports)
}
