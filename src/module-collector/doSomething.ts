import FileTree from '../server/compiler/helpers/FileTree'
import isState from '../state/is-state'
import {addModule} from './module-builder'
import console from '../utils/console'

let trees: Array<FileTree> | undefined

export default function doSomething(callback: Function, parameters: Array<any>): void {
    trees = trees ?? global['cherry-cola'].importTrees
        .map(tree => FileTree.fromObject(tree))
    const dataStore = global['cherry-cola'].moduleCollector

    const currentFile: FileTree = trees
        .map(tree => tree.find(dataStore.currentFile))
        .filter(v => v)[0]

    // console.log(callback.toString(), currentFile)

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
