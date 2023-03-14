import {State as ClientState} from '../runtime/client-state'
import State from './state'
import {Ref} from './create-ref'
import {autoSetState} from '../compiler/states-collector'

type StateOrRefType = State | Ref
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
export default function doSomething<States extends StateOrRefType[]>(
    callback: (...args: MappedStateOrRefType<States>) => void | Function,
    statesAndRefs: States
) {
    autoSetState(statesAndRefs)
}
