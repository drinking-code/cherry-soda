import FileTree from '../server/compiler/helpers/FileTree'
import isState from '../state/is-state'
import {addModule} from './module-builder'

let trees: Array<FileTree> | undefined

export default function doSomething(callback: Function, parameters: Array<any>): void {
    trees = trees ?? global['cherry-cola'].importTrees
        .map(tree => FileTree.fromObject(tree))
    const dataStore = global['cherry-cola'].moduleCollector

    const currentFile: FileTree = trees
        .map(tree => tree.find(dataStore.currentFile))
        .filter(v => v)[0]

    // console.log(callback.toString(), currentFile)

    // todo: turn states into [state, setState]
    // todo: serialize complex parameters (such as imports) -> imports with "currentFile"
    parameters = parameters
        .map(parameter => {
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

    console.log(parameters)
    addModule(callback.toString(), parameters, currentFile.filename)
}
