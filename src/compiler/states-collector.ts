import State, {isState} from '../state/state'
import {isRef, Ref} from '../state/create-ref'
import {generateId} from '../utils/random'
import {filterObject, mapSet, mapSetToObject} from '../utils/iterate-object'
import {ElementId, HashType, VirtualElement} from '../jsx/VirtualElement'

const componentStates: Map<HashType, Array<(State | Ref | Promise<string>)[]>> = new Map()
const listenedToStates: Set<State['$$stateId']['value']> = new Set()
const componentStatesPromises: Map<Promise<string>, typeof Promise.resolve> = new Map()
const componentStatesPlaceholders: Map<string, [HashType, number, number]> = new Map()
const refs: Set<Ref<VirtualElement>> = new Set()

export function setStates(hash: HashType, doSomethingIndex: number, states: (State | Ref<VirtualElement>)[]) {
    states.forEach((state, index) => {
        setState(hash, doSomethingIndex, index, state)
    })
}

export function setState(hash: HashType, doSomethingIndex: number, stateIndex: number, state: State | Ref<VirtualElement> | Promise<string>, onlySetIfUndefined: boolean = false) {
    if (isState(state) || isRef(state)) {
        listenedToStates.add(state.id)
    }
    if (!componentStates.has(hash)) {
        componentStates.set(hash, [])
    }
    if (!componentStates.get(hash)[doSomethingIndex]) {
        componentStates.get(hash)[doSomethingIndex] = []
    }
    if (onlySetIfUndefined === false || componentStates.get(hash)[doSomethingIndex][stateIndex] === undefined) {
        const stateArray = componentStates.get(hash)[doSomethingIndex]
        if (stateArray[stateIndex] instanceof Promise) {
            componentStatesPromises.get(stateArray[stateIndex] as Promise<string>)((state as State | Ref).id)
        } else {
            stateArray[stateIndex] = state
        }
        if (!isState(state) && !(state instanceof Promise)) { // instanceof Ref would throw
            refs.add(state)
        }
    }
}

export function stateIsListenedTo(state: State) {
    return listenedToStates.has(state.id)
}

export function getRefs(): { [refId: string]: ElementId['fullPath'][] } {
    return filterObject(
        mapSetToObject(refs, ref => {
            return [ref.id, ref.getIds()]
        }), v => v.length > 0
    )
}

const autoData = {
    hash: null,
    doSomethingIndex: null,
}

export function setAutoComponent(hash: HashType) {
    autoData.hash = hash
    autoData.doSomethingIndex = 0
}

export function autoSetState(states: (State | Ref<VirtualElement>)[]) {
    if (autoData.hash === null) return false
    setStates(autoData.hash, autoData.doSomethingIndex, states)
    autoData.doSomethingIndex++
}

export const stateIdPlaceholderPrefix = 'stateIdPlaceholder_'

export function getState(hash: HashType, doSomethingIndex: number, stateIndex: number, givePlaceholder: boolean = true):
    typeof givePlaceholder extends true | undefined ? string : string | Promise<string> {
    function fallback(): typeof givePlaceholder extends true ? string : string | Promise<string> {
        let resolve
        const promise = new Promise<string>(res => resolve = res)
        componentStatesPromises.set(promise, resolve)
        setState(hash, doSomethingIndex, stateIndex, promise, true)
        if (givePlaceholder)
            return makePlaceholder()
        else
            return promise
    }

    function makePlaceholder(): string {
        const id = generateId()
        const placeholder = stateIdPlaceholderPrefix + id
        componentStatesPlaceholders.set(id, [hash, doSomethingIndex, stateIndex])
        return placeholder
    }

    if (!componentStates.has(hash)) {
        componentStates.set(hash, [])
    }
    if (!componentStates.has(hash)) return fallback()
    const doSomethingStatesArrays = componentStates.get(hash)
    const doSomethingStates = doSomethingStatesArrays[doSomethingIndex]
    if (!doSomethingStates) return fallback()
    const state = doSomethingStates[stateIndex]
    if (!state) return fallback()
    return state instanceof Promise ? state : state.id
}

export function getStateFromPlaceholderId(placeholderId: string) {
    const [hash, doSomethingIndex, stateIndex] = componentStatesPlaceholders.get(placeholderId)
    return getState(hash, doSomethingIndex, stateIndex, false)
}

export function getAllStates() {
    return componentStates
}
