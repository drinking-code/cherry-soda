import {StateId} from './state-id'

export default function createState(initialValue): StateType {
    let stateValue
    if (typeof initialValue === 'string') {
        stateValue = new StringState(initialValue)
    } else if (typeof initialValue === 'number') {
        stateValue = new NumberState(initialValue)
    }
    return stateValue
}

export type StateType = GenericState | StringState | NumberState

export class GenericState {
    $$stateId: StateId

    constructor(id: StateId) {
        this.$$stateId = id
    }

    get value(): null {
        return null
    }
}

export class StringState extends String {
    $$stateId: StateId

    constructor(value: string) {
        super(value)
        this.$$stateId = new StateId()
    }

    get value(): string {
        return String(this)
    }
}

export class NumberState extends Number {
    $$stateId: StateId

    constructor(value: number) {
        super(value)
        this.$$stateId = new StateId()
    }

    get value(): number {
        return Number(this)
    }
}
