import State from './state'
import stringifyValue, {StringifiableType} from '../utils/stringify'
import {VirtualElement} from '../jsx/VirtualElement'
import {getRenderer} from '../renderer/renderer'
import {ClientTemplatesMapType, ServerTemplatesMapType} from '../compiler/template/types'
import stringifyNode from '../compiler/template/stringify-node'

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
    render(clientTemplates?: ClientTemplatesMapType, serverTemplates?: ServerTemplatesMapType): string {
        let transformResult = this.transform(...this.states.map(state => state.valueOf()))
        if (transformResult instanceof VirtualElement)
            transformResult = [transformResult]
        if (Array.isArray(transformResult))
            transformResult = transformResult.map(element => {
                if (!(element instanceof VirtualElement)) return transformResult
                clientTemplates ??= new Map()
                serverTemplates ??= new Map()
                const hash = stringifyNode(element, clientTemplates, serverTemplates)
                return getRenderer(Promise.resolve({clientTemplates, serverTemplates, entry: hash}))()
            }).join('')
        return stringifyValue(transformResult)
    }
}

export function isStateUsage(value: any): value is StateUsage {
    return value instanceof StateUsage
}
