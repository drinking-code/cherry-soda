import {JSX} from '../../index'
import State from '../../state/State'
import VNode, {isEqualVNode} from '../../jsx/VNode'
import TreeMap from './TreeMap'

const elementRenderQueue: JSX.Element[] = []

class SearchableMap<K, V> extends Map<K, V> {
    constructor() {
        super()
    }

    find(predicate: (key: K) => boolean): V {
        for (const key of this.keys()) {
            if (predicate(key)) return this.get(key)
        }
        return undefined
    }
}

declare global {
    interface Window {
        csDev: Record<string, any>;
    }
}

let componentTree: ComponentTree,
    oldComponentTree: ComponentTree,
    stateMap: SearchableMap<JSX.Element, State[]>,
    rebuildStateMap: Map<JSX.Element, State[]>,
    stateInitialValues: WeakMap<State, any>,
    isEqual: typeof import('lodash.isequal')
type ComponentTree = TreeMap<VNode, ComponentTree>

if (process.env.NODE_ENV === 'development') {
    isEqual = (await import('lodash.isequal')).default
    window.csDev ??= {}

    window.csDev.componentTree ??= new TreeMap()
    componentTree = window.csDev.componentTree
    window.csDev.oldComponentTree ??= new TreeMap()
    oldComponentTree = window.csDev.oldComponentTree

    window.csDev.stateMap ??= new SearchableMap()
    stateMap = window.csDev.stateMap
    window.csDev.rebuildStateMap ??= new Map()
    rebuildStateMap = window.csDev.rebuildStateMap

    window.csDev.stateInitialValues = new WeakMap()
    stateInitialValues = window.csDev.stateInitialValues
}

export function registerElementRenderStart(node: JSX.Element) {
    const previousNode = elementRenderQueue.at(-1)

    if (componentTree.hasOnAnyLevel(previousNode)) {
        componentTree.appendChildToNode(previousNode, node)
    } else {
        window.csDev.oldComponentTree = componentTree
        oldComponentTree = window.csDev.oldComponentTree
        window.csDev.componentTree = new TreeMap()
        componentTree = window.csDev.componentTree

        componentTree.appendChild(node)
    }

    const previousNodePath = componentTree.getPath(previousNode)
    const oldPreviousNode = previousNodePath && oldComponentTree.getByPath(previousNodePath)
    const oldStates = oldPreviousNode && stateMap.find(key => {
        return key instanceof VNode
            ? previousNode instanceof VNode && isEqualVNode(key, oldPreviousNode)
            : isEqual(key, oldPreviousNode)
    })
    const newStates = rebuildStateMap.get(previousNode)
    if (oldStates && newStates) {
        if (oldStates.length === newStates.length &&
            newStates.every((newState, index) => {
                return isEqual(stateInitialValues.get(newState), stateInitialValues.get(oldStates[index]))
            })
        ) {
            newStates.forEach((newState, index) => newState.update(oldStates[index].valueOf()))
        }
        stateMap.set(previousNode, newStates)
        rebuildStateMap.delete(previousNode)
    }
    elementRenderQueue.push(node)
}

export function registerElementRenderEnd(node: JSX.Element) {
    if (elementRenderQueue.at(-1) !== node) {
        console.warn(node, 'is not last element in queue')
        const index = elementRenderQueue.findIndex(item => item === node)
        elementRenderQueue.splice(index, 1)
    } else {
        elementRenderQueue.pop()
    }
}

export function registerAndHandleStateCreation(state: State, initialValue: any) {
    const node = elementRenderQueue.at(-1)
    const writeToMap = module.hot.status() !== 'apply' ? stateMap : rebuildStateMap
    if (!writeToMap.has(node)) writeToMap.set(node, [])
    writeToMap.get(node).push(state)
    stateInitialValues.set(state, initialValue)
}
