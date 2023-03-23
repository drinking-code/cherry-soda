import {Ref} from './dom'

function cloneStateValue<V>(value: V): V {
    if (['string', 'number', 'boolean'].includes(typeof value) || [null, undefined].includes(value)) {
        return value
    } else if (typeof value === 'function') {
        return value.bind({})
    } else {
        const valueWithNotFunctionType = value as Exclude<any, Function>
        return new valueWithNotFunctionType.constructor(value)
    }
}

export abstract class AbstractState<V = any> {
    protected _value: V

    protected constructor(value: V) {
        this._value = value
    }

    valueOf(): V {
        return this._value
    }
}

type StateChangeHandlerType = (...args: ([any, (value: any) => void] | HTMLElement)[]) => (() => void) | void

export class State<V = any> extends AbstractState<V> {
    private _listeners: (StateChangeHandlerType)[] = []
    private _listenersCleanup: (ReturnType<StateChangeHandlerType>)[]

    constructor(value: V) {
        super(cloneStateValue(value))
    }

    valueOf(): V {
        return cloneStateValue(super.valueOf())
    }

    updateValue(value: V) {
        this._updateValueInternal(value, false)
    }

    private _updateValueInternal(value: V, forceUpdate: boolean = false) {
        if (!forceUpdate && value === this._value) return
        if (this._listenersCleanup)
            this._listenersCleanup.forEach(cleanup => cleanup && cleanup())
        this._value = cloneStateValue(value)
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

export function getClientState(id: number, value?: any) {
    console.log()
    if (!states.has(id))
        states.set(id, new State(value))
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
