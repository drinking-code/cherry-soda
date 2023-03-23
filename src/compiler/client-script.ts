// extract "doSomething" functions from components and compile them into a file

import Parser from './parser'
import findDoSomethings from './client-script/find-do-somethings'
import getScopedModules, {ClientModulesType} from './client-script/get-scoped-modules'
import StateUsage from '../state/state-usage'
import {getClientState} from '../runtime'
import {stateIsListenedTo} from './states-collector'
import {makeContext, ProtoContextType} from './template/state-usage'

export default function generateClientScriptTrees(parser: Parser): ClientModulesType {
    /*
     * todo: different approach:
     * get stack from doSomething call, then extract function with (used) lexical scope
     */
    // todo: make this whole wonky babel setup more robust to edge cases
    // todo: faster (swc???)
    const doSomethingsScopes = findDoSomethings(parser)
    return getScopedModules(parser, doSomethingsScopes)
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
    // todo: only include if has listener (or rather the setState function is called client-side)
    const stateUsagesName = 'stateUsages'
    const stateUsagesParametersName = 'stateUsagesParameters'
    const stateUsagesContextsName = 'stateUsagesContexts'
    let code = ''
    code += `import {${getClientState.name}} from '/runtime/client-state';`
    code += `const ${stateUsagesName} = new Map();`
    code += `const ${stateUsagesParametersName} = new Map();`
    code += `const ${stateUsagesContextsName} = new Map();`
    stateUsages.forEach((value: StateUsage<any>, key: string) => {
        if (!value.states.some(stateIsListenedTo)) return
        code += '{'
        // todo: put lexical stuff here
        if (value.transform)
            code += `${stateUsagesName}.set('${key}', ${value.transform.toString()});`
        let functionArray = '['
        for (const state of value.states) {
            functionArray += `${getClientState.name}('${state.id}')`
        }
        functionArray += ']'
        code += `${stateUsagesParametersName}.set('${key}', ${functionArray});`
        const stateUsageContexts = JSON.stringify(stateUsageProtoContexts.get(key).map(ctx => makeContext(ctx, value)))
        code += `${stateUsagesContextsName}.set('${key}', ${stateUsageContexts});` // todo: minify
        code += '}'
    })
    code += `export {${stateUsagesName}};`
    code += `export {${stateUsagesParametersName}};`
    return code
}
