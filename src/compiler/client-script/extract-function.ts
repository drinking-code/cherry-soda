import fs from 'fs'

import Parser from '../parser'
import {
    traverseFast,
    FunctionExpression,
    ArrowFunctionExpression,
    Statement,
    FunctionDeclaration,
    ClassDeclaration, VariableDeclarator
} from '@babel/types'
import {HashType} from '../../jsx/VirtualElement'
import {Scope} from './scope'
import {getCurrentComponentHash} from '../template/template-builder'
import {transpiler} from '../../imports/jsx-patch-plugin'

let parser: Parser

const scopes = {}
export type ImportDataType = { importName: string | typeof Scope.importAll | typeof Scope.defaultImport, localName: string, filePath: string }
const lexicalScopes: { [id: HashType]: Array<Statement | ImportDataType>[] } = {}

export function getLexicalScope(id: HashType, index: number) {
    return lexicalScopes[id][index]
}

export async function extractFunction(
    {functionName, filePath, line, column}: { functionName: string, filePath: string, line: number, column: number }
) {
    if (!parser)
        parser = new Parser()

    if (!parser.fileNames.includes(filePath)) {
        const fileContents = fs.readFileSync(filePath, {encoding: 'utf8'})
        const transformedFileContents = transpiler.transformSync(fileContents, 'tsx')
        parser.parseFile(filePath, transformedFileContents)
    }

    const scope: Scope = scopes[filePath] ?? new Scope()
    const thingsInUse: Set<string> = new Set()
    parser.traverseFileFast(filePath, (node) => {
        if (!(filePath in scope)) {
            // declarations
            if (node.type === 'FunctionDeclaration') {
                scope.add(node.id, node)
            } else if (node.type === 'VariableDeclaration') {
                node.declarations.forEach(declaration => {
                    if (declaration.id.type === 'Identifier')
                        scope.add(declaration.id, node)
                })
            } else if (node.type === 'ImportDeclaration') {
                node.specifiers.forEach(importSpecifier => {
                    let importName: string | typeof Scope.importAll | typeof Scope.defaultImport
                    if (importSpecifier.type === 'ImportNamespaceSpecifier') {
                        importName = Scope.importAll
                    } else if (importSpecifier.type === 'ImportDefaultSpecifier') {
                        importName = Scope.defaultImport
                    } else if (importSpecifier.type === 'ImportSpecifier') {
                        if (importSpecifier.imported.type === 'StringLiteral') {
                            importName = importSpecifier.imported.value
                        } else if (importSpecifier.imported.type === 'Identifier') {
                            importName = importSpecifier.imported.name
                        }
                    }
                    if (importName) {
                        scope.addImport(importSpecifier.local.name, importName, node.source.value)
                    }
                })
            } else if (node.type === 'ClassDeclaration') {
                // todo
            }
            // uses / re-assignments
            // todo
        }
        if (node.type !== 'CallExpression' ||
            node.callee.type !== 'Identifier' ||
            node.callee.loc.end.line !== line ||
            node.callee.loc.end.column !== column - 1
        ) return
        const exclude = []
        let func: ArrowFunctionExpression | FunctionExpression
        if (['ArrowFunctionExpression', 'FunctionExpression'].includes(node.arguments[0].type))
            func = node.arguments[0] as ArrowFunctionExpression | FunctionExpression
        // todo: function (identifier)
        // todo: return value ???
        func.params.forEach(node => {
            traverseFast(node, (node) => {
                if (node.type === 'Identifier')
                    exclude.push(node.name)
            })
        })
        traverseFast(func.body, (node) => {
            if (((node): node is (FunctionDeclaration | ClassDeclaration | VariableDeclarator) =>
                ['FunctionDeclaration', 'ClassDeclaration', 'VariableDeclarator'].includes(node.type))(node)
            ) {
                if (node.id.type !== 'Identifier') {
                    // todo
                } else {
                    exclude.push(node.id.name)
                }
            }
            if (node.type === 'Identifier' && !exclude.includes(node.name) && (scope.has(node) || scope.hasImport(node.name))) {
                thingsInUse.add(node.name)
            }
        })
    })
    const id = getCurrentComponentHash()
    if (!lexicalScopes[id])
        lexicalScopes[id] = []
    lexicalScopes[id].push(
        Array.from(thingsInUse.keys())
            .map((thing): [number, Statement[] | ImportDataType] => {
                if (scope.has(scope.getId(thing))) {
                    return [
                        scope.getOrder(scope.getId(thing)),
                        scope.get(scope.getId(thing))
                    ]
                } else if (scope.hasImport(thing)) {
                    return [0, scope.getImport(thing)]
                }
            })
            .sort((a, b) => a[0] - b[0])
            .map(<V>(a: [number, V]): V => a[1])
            .flat()
    )
    scopes[filePath] = scope
}
