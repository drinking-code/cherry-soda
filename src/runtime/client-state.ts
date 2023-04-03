import {findElementByPath} from './dom'
import {HashType} from '../jsx/VirtualElement'
import {ContextType} from '../compiler/template/state-usage'
import {AbstractState} from './abstract-state'
import {getStateListenerCleanupMap} from './state-listener'

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

export type StateChangeHandlerType = (...args: ([any, (value: any) => void] | HTMLElement)[]) => (() => void) | void
type ClientContextType<T extends 'child' | 'prop'> = ContextType<T> & { makeString: (value: string) => string }

declare const stateUsages: Map<HashType, (...values: any[]) => string>
declare const stateUsagesParameters: Map<HashType, State[]>
declare const stateUsagesContexts: Map<HashType, ClientContextType<any>[]>

export class State<V = any> extends AbstractState<V> {
    private _listeners: (StateChangeHandlerType)[] = []
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

    private _updateValueInternal(value: V, forceUpdate: boolean = false, executeListeners: boolean = true) {
        if (!forceUpdate && value === this._value) return
        const stateListenerCleanupMap = getStateListenerCleanupMap()
        this._listeners.forEach(listener => {
            if (!stateListenerCleanupMap.has(listener)) return
            const cleanup = stateListenerCleanupMap.get(listener)
            if (typeof cleanup !== 'function') return
            cleanup()
        })
        this._value = cloneStateValue(value)
        stateStateUsagesMap[this._id]?.forEach(stateUsageId => {
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
        if (executeListeners) {
            this._listeners.forEach(listener => stateListenerCleanupMap.set(listener, listener()))
        }
    }

    update() {
        this._updateValueInternal(this._value, true)
    }

    updateSilently() {
        this._updateValueInternal(this._value, true, false)
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
