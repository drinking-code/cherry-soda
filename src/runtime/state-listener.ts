import {HashType} from '../jsx/VirtualElement'
import {State, StateChangeHandlerType} from './client-state'
import {Ref} from './dom'

declare const stateListeners: Map<HashType, StateChangeHandlerType[]>
declare const stateListenersParameters: Map<HashType, (State | Ref<any>)[][]>

function prepStatesAndRefs(statesAndRefs: (State | Ref<any>)[]): ([any, (value: any) => void] | HTMLElement)[] {
    return statesAndRefs.map(stateOrRef => {
        if (stateOrRef instanceof State)
            return [stateOrRef.valueOf(), stateOrRef.updateValue.bind(stateOrRef)]
        else
            return stateOrRef.valueOf()
    })
}

export function registerStateListeners() {
    // todo only execute state listeners of currently used components
    stateListeners.forEach((listeners, id) => {
        const parametersArray = stateListenersParameters.get(id)
        listeners.forEach((listener, index) => {
            registerStateChangeHandler(listener, parametersArray[index] ?? [])
        })
    })
}

const stateListenerCleanupMap = new Map()
const rawListenerPreppedListenerMap = new Map()

export function getStateListenerCleanupMap() {
    return stateListenerCleanupMap
}

export function registerStateChangeHandler(
    callback: StateChangeHandlerType,
    statesAndRefs: (State | Ref<any>)[]
) {
    rawListenerPreppedListenerMap.set(callback, () => callback(...prepStatesAndRefs(statesAndRefs)))
    statesAndRefs.forEach(state => {
        if (!(state instanceof State)) return
        state.listen(rawListenerPreppedListenerMap.get(callback))
        state.updateSilently()
    })
    const listener = rawListenerPreppedListenerMap.get(callback)
    stateListenerCleanupMap.set(listener, listener())
}

if (typeof window !== 'undefined')
    setTimeout(registerStateListeners)
