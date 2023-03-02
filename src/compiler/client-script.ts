// extract "doSomething" functions from components and compile them into a file

import Parser from './parser'
import findDoSomethings from './helpers/find-do-somethings'
import getScopedModules from './helpers/get-scoped-modules'

export default function extractDoSomethings(parser: Parser) {
    const doSomethingsScopes = findDoSomethings(parser)
    const scopedModulesAst = getScopedModules(parser, doSomethingsScopes)
}
