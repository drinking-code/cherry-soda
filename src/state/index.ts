import State from './State'

type StateMethods<V> = Record<string, (value: V, ...rest: any[]) => V>
type ParametersExceptFirst<F> = F extends (arg0: any, ...rest: infer R) => any ? R : never;

export function state<V = any, U extends StateMethods<V> = StateMethods<V>>(initialValue: V, methods?: U, updater?: Function): State<V> & {
    [K in keyof U]: (...args: ParametersExceptFirst<U[K]>) => ReturnType<U[K]>
} {
    const state = new State<V>(initialValue)
    return new Proxy(state, {
        get(target: typeof state, key: keyof U | keyof State | any) {
            if (Reflect.has(target, key)) return state[key]
            if (key in methods) return (...args) => {
                const newValue = methods[key as keyof U](state._valueOf(), ...args)
                state.update(newValue)
            }
            return undefined
        }
    }) as any
}
