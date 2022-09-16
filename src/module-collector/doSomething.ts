import FileTree from "../server/compiler/helpers/FileTree";

let trees: Array<FileTree> | undefined

export default function doSomething(callback: Function, parameters: Array<any>): void {
    trees = trees ?? global['cherry-cola'].importTrees
        .map(tree => FileTree.fromObject(tree))
    const dataStore = global['cherry-cola'].moduleCollector

    const currentFile = trees
        .map(tree => tree.find(dataStore.currentFile))
        .filter(v => v)[0]
    console.log(callback.toString(), currentFile)

    // console.log(parameters)
    // todo: turn states into [state, setState]
    // todo: serialize complex parameters (such as imports)
}
