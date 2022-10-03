import {NumberState, StringState} from './index'

export default function isState(value): value is StringState | NumberState {
    return !!value.$$stateId
}
