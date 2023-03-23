import {Scope} from '@babel/traverse'

export default function getAllScopeBindings(scope): Scope['bindings'] {
    let bindings = {}
    do {
        bindings = {
            ...scope.bindings,
            ...bindings,
        }
        if (typeof scope.parent === 'undefined') break
        scope = scope.parent
    } while (true)
    return bindings
}
