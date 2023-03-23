import {findElementByPath, Ref} from './dom'
import {HashType} from '../jsx/VirtualElement'
import {ContextType} from '../compiler/template/state-usage'
import {AbstractState} from './abstract-state'

function cloneStateValue<V>(value: V): V {
    if (['string', 'number', 'boolean'].includes(typeof value) || [null, undefined].includes(value)) {
        return value
    } else if (typeof value === 'function') {
        return value.bind({}) // clone function
    } else {
        const valueWithNotFunctionType = value as Exclude<any, Function>
        return new valueWithNotFunctionType.constructor(value)
    }
}

type StateChangeHandlerType = (...args: ([any, (value: any) => void] | HTMLElement)[]) => (() => void) | void
type ClientContextType<T extends 'child' | 'prop'> = ContextType<T> & { makeString: (value: string) => string }

declare const stateUsages: Map<HashType, (...values: any[]) => string>
declare const stateUsagesParameters: Map<HashType, State[]>
declare const stateUsagesContexts: Map<HashType, ClientContextType<any>[]>

export class State<V = any> extends AbstractState<V> {
    private _listeners: (StateChangeHandlerType)[] = []
    private _listenersCleanup: (ReturnType<StateChangeHandlerType>)[]
    private readonly _id: HashType

    constructor(id: HashType, value: V) {
        super(cloneStateValue(value))
        this._id = id
    }

    valueOf(): V {
        return cloneStateValue(super.valueOf())
    }

    updateValue(value: V) {
        this._updateValueInternal(value, false)
    }

    updateValueSilently(value: V) {
        this._value = cloneStateValue(value)
    }

    private _updateValueInternal(value: V, forceUpdate: boolean = false) {
        if (!forceUpdate && value === this._value) return
        if (this._listenersCleanup)
            this._listenersCleanup.forEach(cleanup => cleanup && cleanup())
        this._value = cloneStateValue(value)
        stateStateUsagesMap[this._id].forEach(stateUsageId => {
            const contexts = stateUsagesContexts.get(stateUsageId)
            contexts.forEach(context => {
                let transform
                if (stateUsages.has(stateUsageId)) {
                    transform = stateUsages.get(stateUsageId)
                    transform = stateUsages.get(stateUsageId)
                } else {
                    transform = value => String(value)
                }
                const transformParameters = stateUsagesParameters.get(stateUsageId)
                const target = findElementByPath(context.contextElement)
                const newString = context.makeString(
                    transform(
                        ...transformParameters.map(state => state.valueOf())
                    )
                )
                if (context.type === 'child') {
                    if (target.childElementCount == 0) {
                        target.innerText = newString
                    } else {
                        target.children[context.beforeChild].previousSibling.replaceWith(
                            document.createTextNode(newString)
                        )
                    }
                } else if (context.type === 'prop') {
                    // todo
                }
            })
        })
        this._listenersCleanup = this._listeners.map(listener => listener())
    }

    update() {
        this._updateValueInternal(this._value, true)
    }

    listen(listener: () => void) {
        this._listeners.push(listener)
    }
}

const states = new Map()
declare const stateStateUsagesMap: { [key: HashType]: HashType[] }

export function getClientState(id: HashType, value?: any) {
    if (!states.has(id))
        states.set(id, new State(id, value))
    if (value !== undefined && !states.get(id).valueOf()) {
        states.get(id).updateValueSilently(value)
    }
    return states.get(id)
}

function prepStatesAndRefs(statesAndRefs: (State | Ref<any>)[]): ([any, (value: any) => void] | HTMLElement)[] {
    return statesAndRefs.map(stateOrRef => {
        if (stateOrRef instanceof State)
            return [stateOrRef.valueOf(), stateOrRef.updateValue.bind(stateOrRef)]
        else
            return stateOrRef.valueOf()
    })
}

export function registerStateChangeHandler(
    callback: StateChangeHandlerType,
    statesAndRefs: (State | Ref<any>)[]
) {
    statesAndRefs.forEach(state => {
        if (!(state instanceof State)) return
        state.listen(() => callback(...prepStatesAndRefs(statesAndRefs)))
        state.update()
    })
}
