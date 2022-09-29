export const modules: Array<[string, Array<any>, string]> = []

export function addModule(func: string, parameters: Array<any>, key: string) {
    modules.push([func, parameters, key])
}
