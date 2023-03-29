import {getClientState, State as ClientState} from '../runtime/client-state'
import State from './state'
import {isRef, Ref} from './create-ref'
import {autoSetState} from '../compiler/states-collector'
import {HashType, VirtualElement} from '../jsx/VirtualElement'
import {getCurrentComponentHash} from '../compiler/template/template-builder'
import {findNode} from '../runtime'
import {getCallerPosition} from '../utils/get-caller-position'
import {extractFunction} from '../compiler/client-script/extract-function'

export type StateOrRefType = State | Ref
type StateType = State

type UnwrapState<T extends State<any>> = T extends State<infer U> ? U : never
type UnwrapRef<T extends Ref<any>> = T extends Ref<infer U> ? U : never

// todo: return types of module for ClientSideModule
type MappedDependencyType<State> =
    State extends Ref
        // todo: return specific element type (e.g. ButtonElement)
        ? (UnwrapRef<State> extends HTMLElement ? UnwrapRef<State> : HTMLElement | NodeList)
        : (State extends StateType
            ? [ReturnType<ClientState<UnwrapState<State>>['valueOf']>, ClientState<UnwrapState<State>>['updateValue']]
            : State)

type MappedStateOrRefType<States extends StateOrRefType[]> = {
    [K in keyof States]: MappedDependencyType<States[K]>
} & {
    length: States['length']
}

export type StateListenerType<S extends StateOrRefType[]> = (...args: MappedStateOrRefType<S>) => void | Function

export default function doSomething<States extends StateOrRefType[]>(callback: StateListenerType<States>, statesAndRefs: States) {
    autoSetState(statesAndRefs as Ref<VirtualElement>[])
    includeStateListener(callback, statesAndRefs)
    extractFunction(getCallerPosition(2))
}

const stateListeners: Map<HashType, StateListenerType<any>[]> = new Map()
const stateListenersParameters: Map<HashType, StateOrRefType[][]> = new Map()

function includeStateListener(callback: StateListenerType<any>, statesAndRefs: StateOrRefType[]) {
    // todo: extract lexical scope of function
    const id = getCurrentComponentHash()
    if (!stateListeners.has(id))
        stateListeners.set(id, [])
    if (!stateListenersParameters.has(id))
        stateListenersParameters.set(id, [])
    stateListeners.get(id).push(callback)
    stateListenersParameters.get(id).push(statesAndRefs)
}

export function getStateListenersAsCode() {
    const stateListenersName = 'stateListeners'
    const stateListenersParametersName = 'stateListenersParameters'
    let code = ''
    const newLine = "\n"
    code += `import {${getClientState.name}} from '/runtime/client-state';` + newLine
    code += `import {${findNode.name}} from '/runtime/dom';` + newLine
    code += `const ${stateListenersName} = new Map();` + newLine
    code += `const ${stateListenersParametersName} = new Map();` + newLine
    stateListeners.forEach((callbacks, id) => {
        const statesAndRefArrays = stateListenersParameters.get(id)
        code += '{' + newLine
        // todo: put lexical stuff here
        let stringifiedCallbacks = '['
        for (const callback of callbacks) {
            stringifiedCallbacks += callback.toString()
            stringifiedCallbacks += ','
        }
        stringifiedCallbacks += ']'
        code += `${stateListenersName}.set('${id}', ${stringifiedCallbacks});` + newLine
        let stateArrays = '['
        for (const statesAndRefs of statesAndRefArrays) {
            stateArrays += '['
            for (const stateOrRef of statesAndRefs) {
                if (isRef(stateOrRef)) {
                    stateArrays += `${findNode.name}('${stateOrRef.id}')`
                } else {
                    stateArrays += `${getClientState.name}('${stateOrRef.id}', ${JSON.stringify(stateOrRef.valueOf())})` // todo: use value from ast
                }
                stateArrays += ', '
            }
            stateArrays += '],'
        }
        stateArrays += ']'
        code += `${stateListenersParametersName}.set('${id}', ${stateArrays});` + newLine
        code += '}' + newLine
    })
    code += `export {${stateListenersName}};` + newLine
    code += `export {${stateListenersParametersName}};`
    return code
}
