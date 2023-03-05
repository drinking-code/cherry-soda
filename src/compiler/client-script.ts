// extract "doSomething" functions from components and compile them into a file

import Parser from './parser'
import findDoSomethings from './helpers/find-do-somethings'
import getScopedModules, {ClientModulesType} from './helpers/get-scoped-modules'

export default function generateClientScriptTrees(parser: Parser): ClientModulesType {
    // todo: make this whole wonky babel setup more robust to edge cases
    // todo: faster (swc???)
    const doSomethingsScopes = findDoSomethings(parser)
    return getScopedModules(parser, doSomethingsScopes)
}
