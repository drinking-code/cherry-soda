import path from 'path'

import {
    assignmentExpression,
    callExpression,
    CallExpression, expressionStatement,
    identifier,
    Identifier, memberExpression,
    Node,
    numericLiteral, stringLiteral, variableDeclaration,
    variableDeclarator
} from '@babel/types'
import {NodePath} from '@babel/traverse'
import babel, {BabelFileResult, transformFromAstSync} from '@babel/core'
import babelPluginMinifyDeadCodeElimination from 'babel-plugin-minify-dead-code-elimination'
import babelPluginRemoveUnusedImport from 'babel-plugin-remove-unused-import'

import Parser from '../parser'
import {iterateObject} from '../../utils/iterate-object'
import {cherryColaIndex, DoSomethingsScopesType, isCherryColaFunction} from './find-do-somethings'
import resolveImportFileSpecifier from '../helpers/resolve-import-file-specifier'
import getAllScopeBindings from '../helpers/all-scope-bindings'
import {createRef, createState} from '#cherry-cola'
import {generateId} from '../../utils/random'
import {getState} from '../states-collector'
import getComponentHashFromScope from './get-component-hash-from-scope'
import {createClientState, registerStateChangeHandler} from '../../runtime'

export type ClientModulesType = { [filename: string]: BabelFileResult }

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
        // console.log(functionComponents)
        let programScopeBeforeImportDeletion
        const probableStates = {}
        // parser.printFileTree(fileName)
        const stateDeclarationCalls: Map<Identifier, CallExpression> = new Map()
        const getStateDeclarationCall = identifierNeedle => stateDeclarationCalls.get(
            Array.from(stateDeclarationCalls.keys()).find(haystackIdentifier => identifierNeedle.name === haystackIdentifier.name)
        )
        const ast = parser.traverseClonedFile(fileName, {
            ImportDeclaration(nodePath) {
                programScopeBeforeImportDeletion ??= getAllScopeBindings(nodePath.scope)
                if (resolveImportFileSpecifier(path.dirname(fileName), nodePath.node.source.value) === cherryColaIndex)
                    nodePath.remove()
            },
            FunctionDeclaration(nodePath) {
                if (functionComponents.some(functionComponent => nodeMatches(functionComponent, nodePath.node))) {
                    if (nodePath.parentPath.isExportDeclaration())
                        nodePath.parentPath.replaceWith(nodePath)
                    nodePath.replaceWith(nodePath.get('body') /* always blockStatement */)
                }
            },
            CallExpression(nodePath) {
                const fileImports = parser.getImports(fileName)
                const allBindings = getAllScopeBindings(nodePath.scope)
                const allBindingsBeforeImportDeletion = {
                    ...programScopeBeforeImportDeletion,
                    ...allBindings,
                }
                if ((doSomethingCalls as Node[]).some(node => nodeMatches(node, nodePath.node as Node))) {
                    const secondArgument = nodePath.node.arguments[1]
                    if (secondArgument && secondArgument.type === 'ArrayExpression') {
                        const arrayName = 'statesToListenTo_' + generateId()
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
                                const stateId = getState(
                                    getComponentHashFromScope(nodePath.scope, parser, fileName),
                                    (doSomethingCalls as Node[]).findIndex(node => nodeMatches(node, nodePath.node)),
                                    i
                                ) as string
                                getStateDeclarationCall(stateIdentifier).arguments.push(stringLiteral(stateId))
                            })
                        nodePath.node.arguments[1] = identifier(arrayName)
                    }
                    getNodeId(nodePath.node).name = registerStateChangeHandler.name
                } else if (isCherryColaFunction(nodePath, fileImports, createState, allBindingsBeforeImportDeletion)) {
                    const identifier = getNodeId(nodePath.node)
                    identifier.name = createClientState.name
                    stateDeclarationCalls.set(getNodeId(nodePath.parentPath.node), nodePath.node)
                } else if (isCherryColaFunction(nodePath, fileImports, createRef, allBindingsBeforeImportDeletion)) {
                    const identifier = getNodeId(nodePath.node)
                    identifier.name = 'findNode' // todo: use function name from runtime
                    stateDeclarationCalls.set(getNodeId(nodePath.parentPath.node), nodePath.node)
                }
            },
            // @ts-ignore
            'AssignmentExpression|VariableDeclarator'(nodePath) {
                const node = nodePath.node
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
                if (!isCherryColaFunction(fakePath as NodePath<CallExpression>, fileImports, [createState, createRef], allBindingsBeforeImportDeletion))
                    return
                probableStates[name.name] = value
            },
            ReturnStatement(nodePath) {
                if (!functionComponents.some(functionComponent =>
                    nodeMatches(functionComponent, nodePath.scope.block as Node)
                )) return
                nodePath.remove()
            },
        })

        const sourceCode = parser.files[fileName]
        let result = transformFromAstSync(ast, sourceCode, {
            ast: true,
            sourceMaps: true,
            sourceFileName: fileName,
            plugins: [
                babel.createConfigItem(babelPluginMinifyDeadCodeElimination),
            ],
        })
        // because imports are placed at the top of the file, imported things that are later overwritten and
        // subsequently not used are left out if both plugins were run in parallel
        result = transformFromAstSync(result.ast, sourceCode, {
            ast: true,
            sourceMaps: true,
            sourceFileName: fileName,
            plugins: [
                babel.createConfigItem(babelPluginRemoveUnusedImport),
            ],
        })
        clientModules[fileName] = result
    })

    return clientModules
}
