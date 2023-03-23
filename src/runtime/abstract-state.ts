export abstract class AbstractState<V = any> {
    protected _value: V

    protected constructor(value: V) {
        this._value = value
    }

    valueOf(): V {
        return this._value
    }
}
