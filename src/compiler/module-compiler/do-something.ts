import FileTree from '../helpers/FileTree'
import isState from '../../state/is-state'
import {addModule} from './index'
import console from '../../utils/console'
import {default as iposPromise} from '../../ipos'

let trees: Array<FileTree> | undefined

const ipos = await iposPromise

export default function doSomething(callback: Function, parameters: Array<any>): void {
    if (!ipos.moduleCollector) return
    trees = trees ?? ipos.importTrees
    const dataStore = ipos.moduleCollector

    const currentFile: FileTree = trees
        .map(tree => tree.find(dataStore.currentFile))
        .filter(v => v)[0]

    // todo: serialize complex parameters (such as imports) -> imports with "currentFile"
    parameters = parameters
        .map(parameter => {
            // todo: turn states into [state, setState]
            // perhaps do that on the client for smaller package
            if (!isState(parameter))
                return parameter
            return [parameter, () => 0]
        }).map(parameter => {
            // todo recursively serialise values
            if (Array.isArray(parameter) || parameter.constructor === {}.constructor) {
                return JSON.stringify(parameter)
            }
            if (['number', 'string', 'function'].includes(typeof parameter) || parameter.toString)
                return parameter.toString()
            // todo
        })

    addModule(callback.toString(), parameters, currentFile.filename)
}
