import {v4 as uuid} from 'uuid'

export type SerializedStateId = string

export class StateId {
    protected value: string

    constructor() {
        this.value = uuid()
    }

    serialize(): SerializedStateId {
        return this.value
    }

    static from(data: SerializedStateId) {
        const newStateId = new StateId()
        newStateId.value = data
        return newStateId
    }
}
