import {isVirtualElement, VirtualElement} from '../../jsx/VirtualElement'
import State, {isState} from '../../state/state'
import StateUsage, {isStateUsage} from '../../state/state-usage'
import {getClientState} from '../../runtime'
import {stateIsListenedTo} from '../states-collector'

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

const stateUsages: Map<string, StateUsage<any>> = new Map()
const stateUsageProtoContexts: Map<string, ProtoContextType<any>[]> = new Map()

export function includeStateUsage(stateUsage: StateUsage, context: ProtoContextType<any>) {
    // todo: extract lexical scope of function (if function is given)
    stateUsages.set(stateUsage.id, stateUsage)
    if (!stateUsageProtoContexts.has(stateUsage.id)) {
        stateUsageProtoContexts.set(stateUsage.id, [])
    }
    stateUsageProtoContexts.get(stateUsage.id).push(context)
}

export function getStateUsagesAsCode() {
    const stateUsagesName = 'stateUsages'
    const stateUsagesParametersName = 'stateUsagesParameters'
    const stateUsagesContextsName = 'stateUsagesContexts'
    const stateStateUsagesMapName = 'stateStateUsagesMap'
    let code = ''
    code += `import {${getClientState.name}} from '/runtime/client-state';`
    code += `const ${stateUsagesName} = new Map();`
    code += `const ${stateUsagesParametersName} = new Map();`
    code += `const ${stateUsagesContextsName} = new Map();`
    const stateStateUsagesMap = {}
    stateUsages.forEach((usage: StateUsage<any>, key: string) => {
        if (!usage.states.some(stateIsListenedTo)) return
        code += '{'
        // todo: put lexical stuff here
        if (usage.transform)
            code += `${stateUsagesName}.set('${key}', ${usage.transform.toString()});`
        let functionArray = '['
        for (const state of usage.states) {
            functionArray += `${getClientState.name}('${state.id}')`
            if (!stateStateUsagesMap[state.id]) {
                stateStateUsagesMap[state.id] = []
            }
            stateStateUsagesMap[state.id].push(usage.id)
        }
        functionArray += ']'
        code += `${stateUsagesParametersName}.set('${key}', ${functionArray});`
        const stateUsageContexts = '[' + stateUsageProtoContexts.get(key)
            .map(ctx => stringifyContext(makeContext(ctx, usage)))
            .join(',') + ']'
        code += `${stateUsagesContextsName}.set('${key}', ${stateUsageContexts});` // todo: minify
        code += '}'
    })
    code += `export {${stateUsagesName}};`
    code += `export {${stateUsagesParametersName}};`
    code += `export {${stateUsagesContextsName}};`
    code += `export const ${stateStateUsagesMapName} = ${JSON.stringify(stateStateUsagesMap)};`
    return code
}

function stringifyContext(context: ContextType<any>): string {
    let contextString = '{'
    contextString += `type:"${context.type}",`
    contextString += `contextElement:${JSON.stringify(context.contextElement)},`
    if (context.prop !== undefined)
        contextString += `prop:"${context.prop}",`
    if (context.beforeChild !== undefined)
        contextString += `beforeChild:${context.beforeChild},`
    if (context.makeString !== undefined)
        contextString += `makeString:${context.makeString},`
    contextString += '}'
    return contextString
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
