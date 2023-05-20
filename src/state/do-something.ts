import path from 'path'

import {getClientState, type State as ClientState} from '../runtime/client-state'
import State from './state'
import {isRef, Ref} from './create-ref'
import {autoSetState} from '../compiler/states-collector'
import {HashType, VirtualElement} from '../jsx/VirtualElement'
import {getCurrentComponentHash} from '../compiler/template/template-builder'
import {findNode} from '../runtime'
import {getCallerPosition} from '../utils/get-caller-position'
import {extractFunction} from '../compiler/client-script/extract-function'
import {getStringifiedLexicalScope} from '../compiler/client-script/stringify-scope'
import {entryDir, stateListenersFileName, callbacksFileName} from '../compiler/client-script/generate-data-files'
import {numberToAlphanumeric} from '../utils/number-to-string'

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

const stateListeners: Map<HashType, HashType[]> = new Map()
const callbacks: Map<HashType, StateListenerType<any>> = new Map()
const callbackHashToComponentHashMap: Map<HashType, [HashType, number]> = new Map()
const stateListenersParameters: Map<HashType, StateOrRefType[][]> = new Map()

function includeStateListener(callback: StateListenerType<any>, statesAndRefs: StateOrRefType[]) {
    const id = getCurrentComponentHash()
    if (!stateListeners.has(id))
        stateListeners.set(id, [])
    if (!stateListenersParameters.has(id))
        stateListenersParameters.set(id, [])
    const callbackHash = numberToAlphanumeric(Bun.hash(callback.toString()) as number)
    if (!callbacks.has(callbackHash))
        callbacks.set(callbackHash, callback)
    if (!callbackHashToComponentHashMap.has(callbackHash))
        callbackHashToComponentHashMap.set(callbackHash, [id, stateListeners.get(id).length])
    stateListeners.get(id).push(callbackHash)
    stateListenersParameters.get(id).push(statesAndRefs)
}

export function clearComponentStateListeners() {
    const id = getCurrentComponentHash()
    stateListeners.set(id, [])
    stateListenersParameters.set(id, [])
}

export function getStateListenersAsCode(): { [fileName: string]: string } {
    const stateListenersName = 'stateListeners'
    const stateListenersParametersName = 'stateListenersParameters'
    let mainFile = ''
    const newLine = "\n"
    mainFile += `import {${getClientState.name}} from '/runtime/client-state';` + newLine
    mainFile += `import {${findNode.name}} from '/runtime/dom';` + newLine
    mainFile += `const ${stateListenersName} = new Map();` + newLine
    mainFile += `const ${stateListenersParametersName} = new Map();` + newLine
    const files: { [fileName: string]: string } = {}
    let callbackFile = ''
    callbacks.forEach((callback, hash) => {
        const [id, index] = callbackHashToComponentHashMap.get(hash)
        callbackFile += `let _${hash};`
        callbackFile += '{'
        callbackFile += getStringifiedLexicalScope(
            id, Number(index),
            importPath => path.join(entryDir, importPath)
        ) + ';' + newLine
        callbackFile += `_${hash} = ${callback.toString()}`
        callbackFile += '}'
        callbackFile += `export {_${hash}}`
    })
    stateListeners.forEach((callbacks, id) => {
        const componentFileName = `${id}.js`
        let componentFile = ''
        const statesAndRefArrays = stateListenersParameters.get(id)
        let stringifiedCallbacks = '['
        let componentFileImportNames = ''
        for (const index in callbacks) {
            componentFileImportNames += '_' + callbacks[index]
            componentFileImportNames += ','
            stringifiedCallbacks += `_${callbacks[index]}`
            stringifiedCallbacks += ','
        }
        stringifiedCallbacks += ']'
        componentFile += `import {${componentFileImportNames}} from './${callbacksFileName}'` + newLine
        componentFile += `export const callbacks = ${stringifiedCallbacks}` + newLine
        mainFile += `import {callbacks as callbacks_${id}} from './${componentFileName}'` + newLine
        mainFile += `${stateListenersName}.set('${id}', callbacks_${id});` + newLine
        componentFile += 'export const states = ['
        for (const statesAndRefs of statesAndRefArrays) {
            componentFile += '['
            for (const stateOrRef of statesAndRefs) {
                if (isRef(stateOrRef)) {
                    componentFile += `${findNode.name}('${stateOrRef.id}')`
                } else {
                    componentFile += `${getClientState.name}('${stateOrRef.id}', ${JSON.stringify(stateOrRef.valueOf())})` // todo: use value from ast
                }
                componentFile += ', '
            }
            componentFile += '],'
        }
        componentFile += '];'
        mainFile += `import {states as states_${id}} from './${componentFileName}'` + newLine
        mainFile += `${stateListenersParametersName}.set('${id}', states_${id});` + newLine
        files[componentFileName] = componentFile
    })
    mainFile += `export {${stateListenersName}};` + newLine
    mainFile += `export {${stateListenersParametersName}};`
    files[stateListenersFileName] = mainFile
    files[callbacksFileName] = callbackFile

    return files
}
