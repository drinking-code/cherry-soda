import {SerializedStateId, StateId} from './state-id'

export default function createState(initialValue) {
    let stateValue
    if (typeof initialValue === 'string') {
        stateValue = new StringState(initialValue)
    } else if (typeof initialValue === 'number') {
        stateValue = new NumberState(initialValue)
    }
    return stateValue
}

class StringState extends String {
    $$stateId: StateId

    constructor(value: string) {
        super(value)
        this.$$stateId = new StateId()
    }

    get value(): string {
        return String(this)
    }
}

class NumberState extends Number {
    $$stateId: StateId

    constructor(value: number) {
        super(value)
        this.$$stateId = new StateId()
    }

    get value(): number {
        return Number(this)
    }
}
