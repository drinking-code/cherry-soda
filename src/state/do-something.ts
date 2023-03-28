import {State as ClientState} from '../runtime/client-state'
import State from './state'
import {Ref} from './create-ref'
import {autoSetState} from '../compiler/states-collector'
import {HashType, VirtualElement} from '../jsx/VirtualElement'
import {getCurrentComponentHash} from '../compiler/template/template-builder'

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
    // const err = new Error()
    // console.log(err.stack)
    autoSetState(statesAndRefs as Ref<VirtualElement>[])
    includeStateListener(callback, statesAndRefs)
}

const stateListeners: Map<HashType, StateListenerType<any>> = new Map()
const stateListenersParameters: Map<HashType, StateOrRefType[]> = new Map()

function includeStateListener(callback: StateListenerType<any>, statesAndRefs: StateOrRefType[]) {
    // todo: extract lexical scope of function
    const id = getCurrentComponentHash()
    stateListeners.set(id, callback)
    stateListenersParameters.set(id, statesAndRefs)
}

export function getStateListenersAsCode() {
    const stateListenersName = 'stateListeners'
    // const stateUsagesParametersName = 'stateUsagesParameters'
    // const stateUsagesContextsName = 'stateUsagesContexts'
    // const stateStateUsagesMapName = 'stateStateUsagesMap'
    let code = ''
    // code += `import {${getClientState.name}} from '/runtime/client-state';`
    code += `const ${stateListenersName} = new Map();`
    // code += `const ${stateUsagesParametersName} = new Map();`
    // code += `const ${stateUsagesContextsName} = new Map();`
    // const stateStateUsagesMap = {}
    stateListeners.forEach((callback, id) => {
        const statesAndRefs = stateListenersParameters.get(id)
        code += '{'
        // todo: put lexical stuff here
        code += `${stateListenersName}.set('${id}', ${callback.toString()});`
        // let functionArray = '['
        // for (const state of usage.states) {
        //     functionArray += `${getClientState.name}('${state.id}')`
        //     if (!stateStateUsagesMap[state.id]) {
        //         stateStateUsagesMap[state.id] = []
        //     }
        //     stateStateUsagesMap[state.id].push(usage.id)
        // }
        // functionArray += ']'
        // code += `${stateUsagesParametersName}.set('${key}', ${functionArray});`
        // const stateUsageContexts = '[' + stateUsageProtoContexts.get(key)
        //     .map(ctx => stringifyContext(makeContext(ctx, usage)))
        //     .join(',') + ']'
        // code += `${stateUsagesContextsName}.set('${key}', ${stateUsageContexts});` // todo: minify
        code += '}'
    })
    code += `export {${stateListenersName}};`
    // code += `export {${stateUsagesParametersName}};`
    // code += `export {${stateUsagesContextsName}};`
    // code += `export const ${stateStateUsagesMapName} = ${JSON.stringify(stateStateUsagesMap)};`
    return code
}
