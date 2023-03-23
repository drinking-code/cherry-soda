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
