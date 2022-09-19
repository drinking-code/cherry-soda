import {VirtualElement} from '../jsx/VirtualElement'
import {Body, Head, Html} from '../index'
import Document from '../dom/default-document'
import FileTree from '../server/compiler/helpers/FileTree'
import {addImports, closeModuleBuilder} from "./module-builder";

let trees: Array<FileTree> | undefined

export default function callFunctionComponent(element: VirtualElement) {
    if (!global['cherry-cola'].moduleCollector)
        global['cherry-cola'].moduleCollector = {}
    const dataStore = global['cherry-cola'].moduleCollector
    const isFirstCall = !element.id.parent

    // @ts-ignore "Function" does not match "({ ...props }: { [x: string]: any; }) => any"
    if ([Document, Html, Head, Body].includes(element.function))
        // todo: if ever a doSomething is in a builtin
        return element
            .function({...element.props, children: element.children})
            .render(0, element.id)

    trees = trees ?? global['cherry-cola'].importTrees
        .map(tree => FileTree.fromObject(tree))

    if (isFirstCall)
        dataStore.currentFile = process.env.CHERRY_COLA_ENTRY

    const functionComponentsFile =
        trees
            .map(tree => tree.find(dataStore.currentFile))
            .filter(v => v)[0]
            ?.imports
            .find(imp => Array.from(Object.values(imp.specifiers))
                .includes(element.function.name)
            )
            ?.fileTree

    dataStore.parentFile = dataStore.currentFile
    dataStore.currentFile = functionComponentsFile?.filename

    // console.log(element.function.name, dataStore.currentFile)
    // console.log(dataStore.parentFile, dataStore.currentFile)

    const virtualElement = element
        .function({...element.props, children: element.children})

    if (isFirstCall)
        closeModuleBuilder()

    return virtualElement.render(0, element.id)
}
