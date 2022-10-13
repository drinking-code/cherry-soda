import IPOS from 'ipos'

import {default as iposPromise} from '../../ipos.js'
import {ElementId, isVirtualElement, VirtualElement} from '../../jsx/VirtualElement'
import {ElementChild, ElementChildren} from '../../jsx/ElementChildren'
import FileTree, {Import} from '../helpers/FileTree'
import {isElementChildren} from '#render-element'
import {collectStatesTemplates} from './states'
import {RootTag, VirtualRenderedElement} from './VirtualRenderedElement'
import isState from '../../state/is-state'
import {StateType} from '../../state'
import {reportNewDom} from "../../server/dynamic-code-synchronisation/report";

const ipos: IPOS = await iposPromise

let moduleCollector: {
    currentFile?: string,
    parentFile?: string
}
const importTrees: Array<FileTree> = ipos.importTrees as Array<FileTree>
if (!ipos.currentDomTree)
    ipos.create('currentDomTree', new VirtualRenderedElement(RootTag, ElementId.fromPath([])))
const currentDomTree: VirtualRenderedElement = ipos.currentDomTree as VirtualRenderedElement

export function iterateFunctionComponents(element: VirtualElement, isFirstCall: boolean = false): VirtualRenderedElement | VirtualRenderedElement[] {
    let currentNewElement: VirtualRenderedElement
    if (isFirstCall) {
        if (!ipos.moduleCollector) {
            ipos.create('moduleCollector', {})
            moduleCollector = ipos.moduleCollector
        }
        moduleCollector.currentFile = process.env.CHERRY_COLA_ENTRY
    }

    if (element.type === 'function') {
        const currentFile = importTrees.map((tree: FileTree) =>
            tree.find(moduleCollector.currentFile)
        ).filter(v => !!v)[0] as FileTree | undefined
        const currentFileImports = currentFile?.imports
        const functionComponentsFile: FileTree = currentFileImports.find((imp: Import) =>
            Array.from(Object.values(imp.specifiers)).includes(element.function.name)
        )?.fileTree

        moduleCollector.parentFile = moduleCollector.currentFile
        moduleCollector.currentFile = functionComponentsFile?.filename

        const returnedVirtualElement: VirtualElement | ElementChildren = element.function({
            ...element.props,
            children: element.children
        })
        if (isElementChildren(returnedVirtualElement)) {
            const rendered = Array.from(returnedVirtualElement).map((el, i) => {
                el.trace(i, element.id)
                return iterateFunctionComponents(el)
            }).flat()
            if (isFirstCall) {
                firstCallCleanup(rendered)
            }
            return rendered
        } else {
            returnedVirtualElement.trace(0, element.id)
            const rendered = iterateFunctionComponents(returnedVirtualElement)
            if (isFirstCall) {
                firstCallCleanup(rendered)
            }
            return rendered
        }
    } else {
        currentNewElement = new VirtualRenderedElement(element.type, element.id)
    }

    if (element.props.ref) {
        element.props.ref.populate(element)
    }

    const filteredChildren: ElementChildren = element.children.flat().filter(v => v)
    let elementIndex = 0
    filteredChildren.forEach((child: ElementChild) => {
        // child as string, VirtualElement, or State
        const stringChild = collectStatesTemplates(child, elementIndex, element.id)

        // child as string, VirtualRenderedElement (or array of VirtualRenderedElement), or State
        let renderedChild: string | VirtualRenderedElement | VirtualRenderedElement[] | StateType
        if (isVirtualElement(stringChild)) {
            stringChild.trace(elementIndex++, element.id)
            renderedChild = iterateFunctionComponents(stringChild)
        } else {
            renderedChild = stringChild
        }
        const renderedChildArray = Array.isArray(renderedChild) ? renderedChild : [renderedChild]
        renderedChildArray.forEach(item => {
            if (typeof item === 'string' || isState(item)) {
                currentNewElement.appendText(item)
            } else {
                currentNewElement.append(item)
            }
        })
    })

    function firstCallCleanup(newDomTree: VirtualRenderedElement | VirtualRenderedElement[]) {
        ipos.delete('moduleCollector')
        const newDomTreeArray = Array.isArray(newDomTree) ? newDomTree : [newDomTree]
        const newDomTreeWithRoot = new VirtualRenderedElement(RootTag, ElementId.fromPath([]))
        newDomTreeWithRoot.append(...newDomTreeArray)

        if (currentDomTree.children.length > 0) {
            reportNewDom(currentDomTree.getDiff(newDomTreeWithRoot))
        }

        currentDomTree.clean()
        currentDomTree.append(...newDomTreeArray)
    }

    if (isFirstCall) {
        firstCallCleanup(currentNewElement)
    }

    return currentNewElement
}
