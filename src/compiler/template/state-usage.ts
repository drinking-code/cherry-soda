import {VirtualElementInterface} from '../../jsx/cherry-cola'
import {isVirtualElement, VirtualElement} from '../../jsx/VirtualElement'
import State, {isState} from '../../state/state'
import StateUsage, {isStateUsage} from '../../state/state-usage'

export type ContextType<T extends 'child' | 'prop'> = {
    type: T,
    contextElement: VirtualElement['_id']['fullPath']
    prop: T extends 'prop' ? string : never,
    beforeChild: T extends 'child' ? number : never,
    makeString: string // (stateValue: string) => string
}

export type ProtoContextType<T extends 'child' | 'prop'> = {
    type: T,
    contextElement?: VirtualElement,
    prop: T extends 'prop' ? string : never,
}

export function makeContext<T extends 'child' | 'prop'>(
    {type, contextElement, prop}: ProtoContextType<T>, stateUsage: StateUsage
): ContextType<T> {
    const context: ContextType<T> = {
        type,
        contextElement: contextElement.id,
    } as ContextType<T>
    if (type === 'child') {
        const stateIndex = contextElement.children.findIndex(element => element === stateUsage || stateUsage.states.includes(element))
        let nextElement
        for (const index in contextElement.children) {
            if (Number(index) == stateIndex) break
            const child = contextElement.children[index]
            if (isVirtualElement(child)) nextElement = child
        }
        if (!nextElement) context.beforeChild = 0 as T extends 'child' ? number : never
        else context.beforeChild = nextElement._id.index + 1
        let strings = []
        for (const child of contextElement.children) {
            if (isVirtualElement(child)) {
                if (child._id.index == context.beforeChild) break
                else strings = []
            } else strings.push(child)
        }
        let functionString = 'value => `'
        for (const string of strings) {
            if (isState(string) || isStateUsage(string)) functionString += '${value}'
            else functionString += string
        }
        functionString += '`'
        context.makeString = functionString
    } else {
        context.prop = prop
        // todo
    }
    return context as ContextType<T>
}
