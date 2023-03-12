const cloneableConstructors = [Object, WeakRef, Array, Map, Set, WeakMap, WeakSet] // todo: add all here

function cloneStateValue(value) {
    if (['string', 'number', 'boolean'].includes(typeof value) || [null, undefined].includes(value))
        return value
    else if (cloneableConstructors.includes(value.constructor))
        return new value.constructor(value)
}

class State<V = any> {
    private _value: V
    private _listeners: (() => void)[] = []

    constructor(value: V) {
        this._value = cloneStateValue(value)
    }

    valueOf(): V {
        return cloneStateValue(this._value)
    }

    updateValue(value: V) {
        this._value = cloneStateValue(value)
        this._listeners.forEach(listener => listener())
    }

    listen(listener: () => void) {
        this._listeners.push(listener)
    }
}

class Ref {

}

export function createClientState(value: any, id: number) {
    return new State(value)
}

function prepStatesAndRefs(statesAndRefs: (State | Ref)[]): ([any, (value: any) => void] | HTMLElement)[] {
    return statesAndRefs.map(stateOrRef => {
        if (stateOrRef instanceof State)
            return [stateOrRef.valueOf(), stateOrRef.updateValue]
        else
            return document.createElement('div') // todo
    })
}

export function registerStateChangeHandler(
    callback: (...preppedStatesAndRefs: ([any, (value: any) => void] | HTMLElement)[]) => void,
    statesAndRefs: (State | Ref)[]
) {
    console.log('register', callback, statesAndRefs)
    statesAndRefs.forEach(state => {
        if (!(state instanceof State)) return
        state.listen(() => callback(...prepStatesAndRefs(statesAndRefs)))
    })
    callback(...prepStatesAndRefs(statesAndRefs))
}
