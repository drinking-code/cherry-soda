import State from './state'
import stringifyValue, {StringifiableType} from '../utils/stringify'

export type StateUsageFunctionType<V, U extends StringifiableType = StringifiableType> = (...values: V[]) => U

export default class StateUsage<V = any> {
    states: State<V>[]
    transform: StateUsageFunctionType<V>
    cachedResult: ReturnType<typeof this.transform> = null

    constructor(states: State<V> | State<V>[], transform: StateUsageFunctionType<V> = (...values: V[]): string => values.join(',')) {
        this.states = states instanceof State ? [states] : states
        this.transform = transform
    }

    /**
     * @internal
     * */
    render(): string {
        return stringifyValue(this.transform(...this.states.map(state => state.valueOf())))
    }
}
