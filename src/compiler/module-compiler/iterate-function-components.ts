import IPOS from 'ipos'

import {default as iposPromise} from '../../ipos.js'
import {VirtualElement} from '../../jsx/VirtualElement'
import {ElementChild} from '../../jsx/ElementChildren'
import FileTree, {Import} from '../helpers/FileTree'

const ipos: IPOS = await iposPromise

const serverOutputPath = process.argv[2]
const App: () => VirtualElement = (await import(`${serverOutputPath}/App.mjs`)).main
if (!ipos.moduleCollector) {
    ipos.create('moduleCollector', {})
}
const moduleCollector: {
    currentFile?: string,
    parentFile?: string
} = ipos.moduleCollector
const importTrees: Array<FileTree> = ipos.importTrees as Array<FileTree>

function iterateFunctionComponents(element: VirtualElement, isFirstCall: boolean = false) {
    if (isFirstCall)
        moduleCollector.currentFile = process.env.CHERRY_COLA_ENTRY

    const functionComponentsFile: FileTree =
        importTrees
            .map((tree: FileTree) => tree.find(moduleCollector.currentFile))
            .filter(v => v)[0]
            ?.imports
            .find((imp: Import) => Array.from(Object.values(imp.specifiers))
                .includes(element.function.name)
            )
            ?.fileTree

    moduleCollector.parentFile = moduleCollector.currentFile
    moduleCollector.currentFile = functionComponentsFile?.filename

    const virtualElement: VirtualElement = element
        .function({...element.props, children: element.children})

    virtualElement.children
        .flat()
        .filter(v => v)
        .forEach((child: ElementChild) => {
            if (!(child instanceof VirtualElement)) return
            iterateFunctionComponents(element)
        })
}

iterateFunctionComponents(App(), true)
ipos.delete('moduleCollector')
process.exit(0)
