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

import {messages as warnings, printWarning} from '../../messages/warnings'
import getAllScopeBindings from './all-scope-bindings'

export default function resolveIdentifierInScope(expression: Identifier | MemberExpression, fullScope: Scope['bindings']) {
    const expressionBinding = fullScope[
        expression.type === 'Identifier'
            ? expression.name
            : (expression.object as Identifier).name
        ]
    if (!expressionBinding) return false
    if (expressionBinding.kind === 'module') return expression
    else if (!['var', 'let', 'const'].includes(expressionBinding.kind)) return expressionBinding.identifier

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
    return resolveIdentifierInScope(originalIdentifier, originalIdentifierScope)
}
