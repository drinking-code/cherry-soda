import {StateType} from './index'

export default function isState(value): value is StateType {
    return !!value.$$stateId
}
