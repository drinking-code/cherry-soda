import FileTree from '../helpers/FileTree'
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

    addModule(callback.toString(), parameters, currentFile.filename)
}
