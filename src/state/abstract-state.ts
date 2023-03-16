import {StateId} from './state-id'

export default abstract class AbstractState {
    $$stateId: StateId

    protected constructor() {
        this.$$stateId = new StateId()
    }
}
