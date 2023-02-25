// extract "doSomething" functions from components and compile them into a file

import {NodePath, Scope} from '@babel/traverse'
import {
    VariableDeclarator,
    Identifier,
    MemberExpression,
    ArrayExpression,
    ObjectExpression,
    NumericLiteral,
    ObjectProperty
} from '@babel/types'

import Parser from './parser'
import getAllScopeBindings from './helpers/all-scope-bindings'
import {messages as warnings, printWarning} from '../messages/warnings'
import resolveImportFileSpecifier from './helpers/resolve-import-file-specifier'

export default function extractDoSomethings(parser: Parser) {
    findDoSomethings(parser)
}

const cherryColaIndex = resolveImportFileSpecifier('', '#cherry-cola')

function findDoSomethings(parser: Parser) {
    parser.fileNames.forEach(fileName =>
        parser.traverseFunctionComponents(fileName, {
            CallExpression(nodePath) {
                // must be a named function
                if (!['Identifier', 'MemberExpression'].includes(nodePath.node.callee.type)) return
                const fullScope = getAllScopeBindings(nodePath.scope)
                // if variable -> resolve to source
                const importedIdentifier = backtrackCalleeToImport(nodePath.node.callee as Identifier | MemberExpression, fullScope)
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
                }
            }
        })
    )
}

function backtrackCalleeToImport(expression: Identifier | MemberExpression, fullScope: Scope['bindings']) {
    const expressionBinding = fullScope[
        expression.type === 'Identifier'
            ? expression.name
            : (expression.object as Identifier).name
        ]
    if (expressionBinding.kind === 'module') return expression
    else if (!['var', 'let', 'const'].includes(expressionBinding.kind)) return false

    const expressionProperty: NumericLiteral | Identifier = expression.type === 'MemberExpression' && expression.property as NumericLiteral | Identifier
    const key = expressionProperty.type === 'NumericLiteral' ? expressionProperty.value : expressionProperty.name // todo: nested properties
    const path: NodePath<VariableDeclarator> = expressionBinding.path as NodePath<VariableDeclarator>
    const init: Identifier | ArrayExpression | ObjectExpression = path.node.init as Identifier | ArrayExpression | ObjectExpression
    // todo: find key / property assignments and push them onto bindings
    let originalIdentifier
    if (init.type == 'Identifier') {
        originalIdentifier = init
    } else if (init.type === 'ObjectExpression') {
        const property: ObjectProperty = init.properties.find(property =>
            property.type === 'ObjectProperty' &&
            (property.key as Identifier).name === key
        ) as ObjectProperty
        if (!property) {
            printWarning(warnings.compiler.backtrackCalleeToImport.couldNotFindKey, [key, (path.node.id as Identifier).name])
            return false
        }
        originalIdentifier = (property.value as Identifier)
    } else if (init.type === 'ArrayExpression') {
        const item: Identifier = init.elements[key]
        if (!item) {
            printWarning(warnings.compiler.backtrackCalleeToImport.couldNotFindKey, [key, (path.node.id as Identifier).name])
            return false
        }
        originalIdentifier = item
    }
    const originalIdentifierScope = getAllScopeBindings(expressionBinding.scope)
    return backtrackCalleeToImport(originalIdentifier, originalIdentifierScope)
}
