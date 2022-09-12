import {v4 as uuid} from 'uuid'

export default function createState(initialValue) {
    let stateValue
    if (typeof initialValue === 'string') {
        stateValue = new StringState(initialValue)
    } else if (typeof initialValue === 'number') {
        stateValue = new NumberState(initialValue)
    }
    return stateValue
}

class StateId {
    value: string

    constructor() {
        this.value = uuid()
    }
}

class StringState extends String {
    $$stateId: StateId

    constructor(value: string) {
        super(value)
        this.$$stateId = new StateId()
    }
}

class NumberState extends Number {
    $$stateId: StateId

    constructor(value: number) {
        super(value)
        this.$$stateId = new StateId()
    }
}
