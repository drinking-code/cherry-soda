// extract "doSomething" functions from components and compile them into a file

import Parser from './parser'
import findDoSomethings from './client-script/find-do-somethings'
import getScopedModules, {ClientModulesType} from './client-script/get-scoped-modules'
import {addMarker} from './profiler'

export default function generateClientScriptTrees(parser: Parser): ClientModulesType {
    /*
     * todo: different approach:
     * get stack from doSomething call, then extract function with (used) lexical scope
     */
    // todo: make this whole wonky babel setup more robust to edge cases
    // todo: faster (swc???)
    addMarker('client-scripts', 'start')
    const doSomethingsScopes = findDoSomethings(parser)
    addMarker('client-scripts', 'find-do-somethings')
    const result = getScopedModules(parser, doSomethingsScopes)
    addMarker('client-scripts', 'end')
    return result
}
