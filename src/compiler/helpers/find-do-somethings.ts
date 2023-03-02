import {CallExpression, Identifier, MemberExpression, Node} from '@babel/types'
import {NodePath, Scope} from '@babel/traverse'

import {doSomething} from '#cherry-cola'
import Parser, {FileToImportsMapType} from '../parser'
import getAllScopeBindings from './all-scope-bindings'
import resolveIdentifierIfImported from './resolve-identifier-if-imported'
import resolveImportFileSpecifier from './resolve-import-file-specifier'

export const cherryColaIndex = resolveImportFileSpecifier('', '#cherry-cola')

export type DoSomethingsScopesType = { [filename: string]: Map<CallExpression, Node[]> }

export default function findDoSomethings(parser: Parser): DoSomethingsScopesType {
    let doSomethingsScopes: DoSomethingsScopesType = {}
    parser.fileNames.forEach(fileName => {
        doSomethingsScopes[fileName] = new Map()
        parser.traverseFunctionComponents(fileName, {
            CallExpression(nodePath) {
                const fileImports = parser.getImports(fileName)
                if (isCherryColaFunction(nodePath, fileImports, doSomething)) {
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

export function isCherryColaFunction(callExpression: NodePath<CallExpression>,
                                     fileImports: FileToImportsMapType,
                                     supposedFunctions: Function | string | (Function | string)[],
                                     fullScope?: ReturnType<typeof getAllScopeBindings>) {
    if (!Array.isArray(supposedFunctions))
        supposedFunctions = [supposedFunctions]
    supposedFunctions = supposedFunctions
        .map(supposedFunction => typeof supposedFunction === 'function' ? supposedFunction.name : supposedFunction)

    // must be a named function
    if (!['Identifier', 'MemberExpression'].includes(callExpression.node.callee.type)) return
    fullScope ??= getAllScopeBindings(callExpression.scope)
    // if variable -> resolve to source
    const importedIdentifier = resolveIdentifierIfImported(callExpression.node.callee as Identifier | MemberExpression, fullScope)
    if (!importedIdentifier) return false
    const importedLocalName = importedIdentifier.name
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
    return supposedFunctions.includes(importedName) && importedFile === cherryColaIndex
}
