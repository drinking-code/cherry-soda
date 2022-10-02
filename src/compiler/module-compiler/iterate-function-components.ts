import IPOS from 'ipos'

import {default as iposPromise} from '../../ipos.js'
import {isVirtualElement, VirtualElement} from '../../jsx/VirtualElement'
import {ElementChild} from '../../jsx/ElementChildren'
import FileTree, {Import} from '../helpers/FileTree'
import {Fragment} from '../../jsx/factory'

const ipos: IPOS = await iposPromise

let moduleCollector: {
    currentFile?: string,
    parentFile?: string
}
const importTrees: Array<FileTree> = ipos.importTrees as Array<FileTree>

export function iterateFunctionComponents(element: VirtualElement, isFirstCall: boolean = false) {
    if (isFirstCall) {
        if (!ipos.moduleCollector) {
            ipos.create('moduleCollector', {})
            moduleCollector = ipos.moduleCollector
        }
        moduleCollector.currentFile = process.env.CHERRY_COLA_ENTRY
    }

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

    const returnedVirtualElement: VirtualElement = element.function({...element.props, children: element.children})
    const flattenedReturnedVirtualElement: VirtualElement[] = flattenFragments([returnedVirtualElement])
    flattenedReturnedVirtualElement.forEach(element => element.trace(0, element.id))

    let i = -1
    returnedVirtualElement.children
        .flat()
        .filter(v => v)
        .forEach((child: ElementChild, index) => {
            if (!isVirtualElement(child)) return
            child.trace(++i, returnedVirtualElement.id)
            if (child.props.ref) {
                child.props.ref.populate(child)
            }
            if (child.type === 'function')
                iterateFunctionComponents(child)
        })

    if (isFirstCall) {
        ipos.delete('moduleCollector')
    }
}

function flattenFragments(elements: VirtualElement[]): VirtualElement[] {
   return elements.map(element => {
       if (element.type === Fragment)
           return element.children
       else
           return element
   }).flat()
}
