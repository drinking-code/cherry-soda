import {default as iposPromise} from '../../ipos'

const ipos = await iposPromise

ipos.create('modules', [])
export const modules: Array<[string, Array<any>, string]> = ipos.modules

export function addModule(func: string, parameters: Array<any>, key: string) {
    modules.push([func, parameters, key])
}
