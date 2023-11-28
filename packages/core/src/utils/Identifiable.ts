import {generateId} from './random'

export default abstract class Identifiable {
    private readonly $$identifier: string

    protected constructor() {
        this.$$identifier = generateId()
    }

    get id() {
        return this.$$identifier
    }
}
