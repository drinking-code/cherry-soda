import {VirtualElementInterface} from './cherry-cola'
import {numberToAlphanumeric} from '../utils/number-to-string'
import {randomNumber} from '../utils/random'
import chalk from 'chalk'

export type HashType = string

export class VirtualElement implements VirtualElementInterface {
    type: VirtualElementInterface['type']
    function: VirtualElementInterface['function']
    props: VirtualElementInterface['props']
    children: VirtualElementInterface['children']
    _id: ElementId
    _originalFunction: VirtualElementInterface['function']
    resultingNodes: VirtualElement[] | VirtualElement

    constructor(type: VirtualElement['type'] | VirtualElement['function'], props: VirtualElement['props'], children?: VirtualElement['children']) {
        if (typeof type === 'function') {
            this.type = 'component'
            this._originalFunction = type
            this.function = (...args) => {
                const result = type(...args)
                this.resultingNodes = result as VirtualElement[] | VirtualElement
                return result
            }
        } else {
            this.type = type
        }
        this.props = props
        this.children = children
    }

    hash(): HashType {
        // seed to generate different hash when using `stringifyNode()`
        return numberToAlphanumeric(
            Bun.hash(
                this._originalFunction?.toString(),
                this._originalFunction?.name === '' && randomNumber(2)
            ) as number
        )
    }

    get realChildren() {
        return this.resultingNodes
            ? (Array.isArray(this.resultingNodes)
                ? this.resultingNodes
                : [this.resultingNodes])
            : this.children
    }

    countChildren(breakCondition?: (child: VirtualElement) => boolean): number {
        let count = 0
        const children = this.realChildren
        let breakConditionTriggered = false
        for (const child of children.filter(isVirtualElement)) {
            if (breakConditionTriggered || (breakCondition && breakCondition(child))) break
            if (child.type == 'component') count += child.countChildren(child => {
                const result = breakCondition(child)
                if (result) breakConditionTriggered = true
                return result
            })
            else count++
        }
        return count
    }

    get domChildrenLength(): number {
        return this.countChildren()
    }

    generatePreliminaryId(parent: VirtualElement | null) {
        this._id = new ElementId(parent, this)
    }

    trace() {
        this._id.trace()
    }

    get id(): number[] | null {
        return this._id?.fullPath
    }
}

export function isVirtualElement(item): item is VirtualElement {
    // instanceof VirtualElement won't work in node because esbuild generates multiple files with the same class
    return item.constructor?.name === VirtualElement.name
}


export class ElementId {
    parent: VirtualElement | null
    index: number
    element: VirtualElement

    constructor(parent: VirtualElement | null, element: VirtualElement) {
        this.parent = parent
        this.element = element
    }

    trace() {
        let domParent = this.parent
        while (domParent?.type === 'component') {
            domParent = domParent._id.parent
        }
        this.index = domParent?.countChildren(child => {
            return child === this.element
        }) ?? 0
    }

    get fullPath(): number[] {
        /*if (this.element.type === 'component')
            console.log(chalk.gray(this.index), this.element._originalFunction.name)
        else
            console.log(chalk.cyan(this.index), this.element.type)*/
        const parentPath = this.parent?._id?.fullPath ?? []
        if (this.element.type === 'component')
            return [...parentPath]
        else
            return [...parentPath, this.index]
    }
}
