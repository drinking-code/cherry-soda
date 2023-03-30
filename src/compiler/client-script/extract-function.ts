import fs from 'fs'

import Parser from '../parser'
import {traverseFast, FunctionExpression, ArrowFunctionExpression} from '@babel/types'
import {HashType} from '../../jsx/VirtualElement'
import {Scope} from './scope'
import {getCurrentComponentHash} from '../template/template-builder'

let parser: Parser
const tsconfig = fs.readFileSync('./tsconfig.json', 'utf8')
const transpiler = new Bun.Transpiler({
    loader: 'tsx',
    autoImportJSX: true,
    platform: 'node',
    tsconfig
})

const scopes = {}
const lexicalScopes: { [id: HashType]: Array<Node | { importName: string, localName: string, filePath: string }> } = {}

export async function extractFunction(
    {functionName, filePath, line, column}: { functionName: string, filePath: string, line: number, column: number }
) {
    if (!parser)
        parser = new Parser()

    if (!parser.fileNames.includes(filePath)) {
        const fileContents = fs.readFileSync(filePath, {encoding: 'utf8'})
        const transformedFileContents = transpiler.transformSync(fileContents, 'tsx')
        console.log(transformedFileContents.split("\n")[line - 1])
        console.log(Array(column - 1).fill(' ').join('') + '^')
        parser.parseFile(filePath, transformedFileContents)
    }

    const scope = scopes[filePath] ?? new Scope()
    const thingsInUse = []
    parser.traverseFileFast(filePath, (node) => {
        if (!(filePath in scope)) {
            // declarations
            if (node.type === 'FunctionDeclaration') {
                scope.add(node.id, node)
            } else if (node.type === 'VariableDeclarator') {
                if (node.id.type === 'Identifier')
                    scope.add(node.id, node)
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
            if (node.type === 'Identifier' && !exclude.includes(node.name) && (scope.has(node) || scope.hasImport(node.name))) {
                thingsInUse.push(node.name)
            }
        })
    })
    lexicalScopes[getCurrentComponentHash()] = thingsInUse
        .map(thing => {
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
        .map(a => a[1])
    scopes[filePath] = scope
}
