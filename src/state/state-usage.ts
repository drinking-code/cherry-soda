import State from './state'
import stringifyValue, {StringifiableType} from '../utils/stringify'
import {VirtualElement} from '../jsx/VirtualElement'
import {getRenderer} from '../renderer/renderer'
import stringifyNode from '../compiler/template/stringify-node'
import AbstractState from './abstract-state'

export type StateUsageFunctionType<V, U extends StringifiableType = StringifiableType> = (...values: V[]) => U

export default class StateUsage<V = any> extends AbstractState {
    states: State<V>[]
    transform: StateUsageFunctionType<V>
    cachedResult: ReturnType<typeof this.transform> = null
    static defaultTransform = (...values: any[]): string => values.join(',')

    constructor(states: State<V> | State<V>[], transform: StateUsageFunctionType<V>) {
        super()
        this.states = states instanceof State ? [states] : states
        this.transform = transform
    }

    /**
     * @internal
     * */
    render(): string {
        let transformResult = this.preRender()
        if (!this.transform)
            transformResult = StateUsage.defaultTransform(transformResult)
        if (Array.isArray(transformResult))
            transformResult = transformResult.map(element => {
                if (!(element instanceof VirtualElement)) return transformResult
                const hash = stringifyNode(element)
                return getRenderer(hash)()
            }).join('')
        return stringifyValue(transformResult)
    }

    /**
     * @internal
     * */
    preRender(): any {
        return (this.transform ?? (v => v))(...this.states.map(state => state.valueOf()))
    }
}

export function isStateUsage(value: any): value is StateUsage {
    return value instanceof StateUsage
}
