import {StateListenerType} from './do-something'
import {HashType} from '../jsx/VirtualElement'
import {getCurrentComponentHash} from '../compiler/template/template-builder'
import State from './state'

const renderFunctions: Map<HashType, StateListenerType<any>[]> = new Map()
const renderParameters: Map<HashType, State[][]> = new Map()

export default function sideEffect<States extends State[]>(callback: StateListenerType<States>, states?: States) {
    const id = getCurrentComponentHash()
    if (!renderFunctions.has(id))
        renderFunctions.set(id, [])
    if (!renderParameters.has(id))
        renderParameters.set(id, [])
    renderFunctions.get(id).push(callback)
    renderParameters.get(id).push(states)
}

export function callComponentRenderFunctions(id: HashType) {
    if (!renderFunctions.has(id)) return
    const parametersArray = renderParameters.get(id)
    renderFunctions.get(id).forEach((callback, index) => {
        const parameters = (parametersArray[index] ?? []).map(state => [state.valueOf(), state.setValue.bind(state)])
        callback(...parameters)
    })
}
