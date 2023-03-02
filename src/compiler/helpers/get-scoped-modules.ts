import path from 'path'
import crypto from 'crypto'

import {
    assignmentExpression,
    callExpression,
    CallExpression, expressionStatement,
    File,
    identifier,
    Identifier, memberExpression,
    Node,
    numericLiteral, variableDeclaration,
    variableDeclarator
} from '@babel/types'
import {NodePath} from '@babel/traverse'
import generate from '@babel/generator'
import babel, {transformFromAstSync} from '@babel/core'
import babelPluginMinifyDeadCodeElimination from 'babel-plugin-minify-dead-code-elimination'
import babelPluginRemoveUnusedImport from 'babel-plugin-remove-unused-import'

import Parser from '../parser'
import {iterateObject} from '../../utils/iterate-object'
import {cherryColaIndex, DoSomethingsScopesType, isCherryColaFunction} from './find-do-somethings'
import resolveImportFileSpecifier from './resolve-import-file-specifier'
import getAllScopeBindings from './all-scope-bindings'
import {createRef, createState} from '#cherry-cola'

export type ClientModulesType = { [filename: string]: File }

export default function getScopedModules(parser: Parser, doSomethings: DoSomethingsScopesType): ClientModulesType {
    const clientModules: ClientModulesType = {}
    iterateObject(doSomethings, ([fileName, doSomethingScopeMap]) => {
        const requisiteScopes = new Set( // deduplicate scopes
            Array.from(doSomethingScopeMap.values()).flat() // all scopes in 1D array
        )

        function getNodeId(node: Node): Identifier | undefined {
            const possibleProps = ['id', 'callee']
            for (const possibleProp of possibleProps) {
                if (possibleProp in node && node[possibleProp].type === 'Identifier') return node[possibleProp]
            }
        }

        function nodeMatches(nodeA: Node, nodeB: Node) {
            const nodeAId = getNodeId(nodeA)
            const nodeBId = getNodeId(nodeB)
            if (nodeAId && nodeBId)
                return nodeAId.name === nodeBId.name
            return null
        }

        if (requisiteScopes.size === 0) // no doSomethings
            return
        const doSomethingCalls = Array.from(doSomethingScopeMap.keys())
        const functionComponents = Array.from(doSomethingScopeMap.values()).map(nodes => nodes[0])
        let programScopeBeforeImportDeletion
        const probableStates = {}
        // parser.printFileTree(fileName)
        const ast = parser.traverseClonedFile(fileName, {
            CallExpression(nodePath) {
                const fileImports = parser.getImports(fileName)
                const allBindings = getAllScopeBindings(nodePath.scope)
                const allBindingsBeforeImportDeletion = {
                    ...programScopeBeforeImportDeletion,
                    ...allBindings,
                }
                if ((doSomethingCalls as Node[]).some(node => nodeMatches(node, nodePath.node as Node))) {
                    getNodeId(nodePath.node).name = 'registerStateChangeHandler' // todo: use function name from runtime
                    const secondArgument = nodePath.node.arguments[1]
                    if (secondArgument && secondArgument.type === 'ArrayExpression') {
                        const arrayName = 'statesToListenTo_' + crypto.randomBytes(4).toString('base64url')
                        nodePath.insertBefore(variableDeclaration('const', [variableDeclarator(
                                identifier(arrayName),
                                callExpression(identifier('Array'), [numericLiteral(secondArgument.elements.length)])
                            )]
                        ))
                        secondArgument.elements
                            .forEach((stateIdentifier, i) => {
                                if (stateIdentifier.type !== 'Identifier' || !probableStates[stateIdentifier.name]) return
                                nodePath.insertBefore(expressionStatement(
                                    assignmentExpression('=',
                                        memberExpression(identifier(arrayName), numericLiteral(i), true),
                                        stateIdentifier
                                    )
                                ))
                            })
                        nodePath.node.arguments[1] = identifier(arrayName)
                    }
                } else if (isCherryColaFunction(nodePath, fileImports, createState, allBindingsBeforeImportDeletion)) {
                    const identifier = getNodeId(nodePath.node)
                    identifier.name = 'createClientState' // todo: use function name from runtime
                } else if (isCherryColaFunction(nodePath, fileImports, createRef, allBindingsBeforeImportDeletion)) {
                    nodePath.remove()
                }
            },
            // @ts-ignore
            'AssignmentExpression|VariableDeclarator'(nodePath) {
                const node = nodePath.node
                /*if (!functionComponents.some(functionComponent =>
                    nodeMatches(functionComponent, nodePath.scope.block as Node)
                )) return*/
                const name = node.type === 'AssignmentExpression' ? node.left : node.id
                const value = node.type === 'AssignmentExpression' ? node.right : node.init
                if (value?.type !== 'CallExpression') return
                const fakePath = {
                    scope: node.scope,
                    node: value
                }
                const fileImports = parser.getImports(fileName)
                const allBindings = getAllScopeBindings(nodePath.scope)
                const allBindingsBeforeImportDeletion = {
                    ...programScopeBeforeImportDeletion,
                    ...allBindings,
                }
                if (!isCherryColaFunction(fakePath as NodePath<CallExpression>, fileImports, [createState], allBindingsBeforeImportDeletion))
                    return
                probableStates[name.name] = value
            },
            ReturnStatement(nodePath) {
                if (!functionComponents.some(functionComponent =>
                    nodeMatches(functionComponent, nodePath.scope.block as Node)
                )) return
                nodePath.remove()
            },
            ImportDeclaration(nodePath) {
                programScopeBeforeImportDeletion ??= getAllScopeBindings(nodePath.scope)
                if (nodePath.node.source.value.match(/\.s?[ac]ss$/) ||
                    resolveImportFileSpecifier(path.dirname(fileName), nodePath.node.source.value) === cherryColaIndex)
                    nodePath.remove()
            },
        })

        const result = transformFromAstSync(ast, generate(ast).code, {
            ast: true,
            plugins: [
                babel.createConfigItem(babelPluginMinifyDeadCodeElimination),
                babel.createConfigItem(babelPluginRemoveUnusedImport),
            ],
        })
        clientModules[fileName] = result.ast
        console.log(generate(result.ast).code)
    })

    return clientModules
}