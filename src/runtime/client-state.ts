import {type HashType} from '../jsx/VirtualElement'
import {AbstractState} from './abstract-state'
import {getStateListenerCleanupMap} from './state-listener'
import {updateStateUsages} from './state-usage'

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
        updateStateUsages(this._id)
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

export function getClientState(id: HashType, value?: any) {
    if (!states.has(id))
        states.set(id, new State(id, value))
    if (value !== undefined && !states.get(id).valueOf()) {
        states.get(id).updateValueSilently(value)
    }
    return states.get(id)
}
