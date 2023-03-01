import {CallExpression, Identifier, MemberExpression, Node} from '@babel/types'
import {Scope} from '@babel/traverse'

import Parser from '../parser'
import getAllScopeBindings from './all-scope-bindings'
import resolveIdentifierInScope from './resolve-identifier-in-scope'
import resolveImportFileSpecifier from './resolve-import-file-specifier'

const cherryColaIndex = resolveImportFileSpecifier('', '#cherry-cola')

// export type DoSomethingsType = { [filename: string]: CallExpression[] }
export type DoSomethingsScopesType = { [filename: string]: Map<CallExpression, Node[]> }

export default function findDoSomethings(parser: Parser): DoSomethingsScopesType {
    // let doSomethings: DoSomethingsType = {}
    let doSomethingsScopes: DoSomethingsScopesType = {}
    parser.fileNames.forEach(fileName => {
        // doSomethings[fileName] = []
        doSomethingsScopes[fileName] = new Map()
        parser.traverseFunctionComponents(fileName, {
            CallExpression(nodePath) {
                // must be a named function
                if (!['Identifier', 'MemberExpression'].includes(nodePath.node.callee.type)) return
                const fullScope = getAllScopeBindings(nodePath.scope)
                // if variable -> resolve to source
                const importedIdentifier = resolveIdentifierInScope(nodePath.node.callee as Identifier | MemberExpression, fullScope)
                if (!importedIdentifier) return
                const importedLocalName = importedIdentifier.name
                // this is an identifier on an import -> must be unique in module scope
                const fileImports = parser.getImports(fileName)
                // must be imported from cherry-cola
                let importedName, importedFile
                for (const importFilePath in fileImports) {
                    const importSpecifiers = fileImports[importFilePath]
                    if (importSpecifiers[importedLocalName]) {
                        importedName = importSpecifiers[importedLocalName]
                        importedFile = importFilePath
                        break
                    }
                }
                if (importedName === 'doSomething' && importedFile === cherryColaIndex) {
                    // called function is cherry-cola's "doSomething"
                    const doSomethingFunction = nodePath.node.arguments[0]
                    // doSomethings[fileName].push(nodePath.node)
                    if (doSomethingFunction.type === 'Identifier') {
                        // todo
                        // console.log(resolveIdentifierInScope(doSomethingFunction, fullScope))
                    }
                    const thisScopeAndParents: Scope[] = [nodePath.scope]
                    let scope = nodePath.scope
                    while (scope.parent) {
                        scope = scope.parent
                        thisScopeAndParents.push(scope)
                    }
                    doSomethingsScopes[fileName].set(nodePath.node as CallExpression, thisScopeAndParents.map(scope => scope.block as Node))

                }
            },
        })
    })
    return doSomethingsScopes
}
