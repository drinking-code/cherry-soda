import {generateId} from '../utils/random'

export type SerializedStateId = string

export class StateId {
    protected value: string

    constructor() {
        this.value = generateId()
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
