import {getClientState, State as ClientState} from '../runtime/client-state'
import State from './state'
import {isRef, Ref} from './create-ref'
import {autoSetState} from '../compiler/states-collector'
import {HashType, VirtualElement} from '../jsx/VirtualElement'
import {getCurrentComponentHash} from '../compiler/template/template-builder'
import {findNode} from '../runtime'
import {getCallerPosition} from '../utils/get-caller-position'
import {extractFunction} from '../compiler/client-script/extract-function'
import {getStringifiedLexicalScope} from '../compiler/client-script/stringify-scope'
import {entryDir, stateListenersFileName} from '../compiler/client-script/generate-data-files'
import path from 'path'

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
    const id = getCurrentComponentHash()
    if (!stateListeners.has(id))
        stateListeners.set(id, [])
    if (!stateListenersParameters.has(id))
        stateListenersParameters.set(id, [])
    stateListeners.get(id).push(callback)
    stateListenersParameters.get(id).push(statesAndRefs)
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
    stateListeners.forEach((callbacks, id) => {
        const componentFileName = `${id}.js`
        let componentFile = ''
        const statesAndRefArrays = stateListenersParameters.get(id)
        let stringifiedCallbacks = '['
        for (const index in callbacks) {
            // todo: put lexical stuff here
            componentFile += getStringifiedLexicalScope(
                id, Number(index),
                importPath => path.join(entryDir, importPath)
            ) + newLine
            stringifiedCallbacks += callbacks[index].toString()
            stringifiedCallbacks += ','
        }
        stringifiedCallbacks += ']'
        componentFile += 'export const callbacks = ' + stringifiedCallbacks + newLine
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
        // console.log()
        // console.log(componentFile)
    })
    mainFile += `export {${stateListenersName}};` + newLine
    mainFile += `export {${stateListenersParametersName}};`
    // return code
    files[stateListenersFileName] = mainFile
    // console.log()
    // console.log(mainFile)
    return files
}
