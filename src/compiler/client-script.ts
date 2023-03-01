// extract "doSomething" functions from components and compile them into a file

import {File, Identifier, Node} from '@babel/types'
import {Scope} from '@babel/traverse'
import generate from '@babel/generator'
import babel, {transformFromAstSync} from '@babel/core'
import babelPluginMinifyDeadCodeElimination from 'babel-plugin-minify-dead-code-elimination'
import babelPluginRemoveUnusedImport from 'babel-plugin-remove-unused-import'

import Parser from './parser'
import {iterateObject} from '../utils/map-object'
import findDoSomethings, {DoSomethingsScopesType} from './helpers/find-do-somethings'

export default function extractDoSomethings(parser: Parser) {
    const doSomethingsScopes = findDoSomethings(parser)
    const scopedModulesAst = getScopedModules(parser, doSomethingsScopes)
}

type ClientModulesType = { [filename: string]: File }

function getScopedModules(parser: Parser, doSomethings: DoSomethingsScopesType): ClientModulesType {
    const clientModules: ClientModulesType = {}
    iterateObject(doSomethings, ([fileName, doSomethingScopeMap]) => {
        const requisiteScopes = new Set( // deduplicate scopes
            Array.from(doSomethingScopeMap.values()).flat() // all scopes in 1D array
        )

        function nodeMatches(nodeA: Node, nodeB: Node) {
            if ('id' in nodeA && 'id' in nodeB) {
                const nodeAId = nodeA.id as Identifier
                const nodeBId = nodeB.id as Identifier
                return nodeAId.name === nodeBId.name
            }
            return null
        }

        function isRequisiteScope(scope: Scope) {
            return Array.from(requisiteScopes.values()).some(block => {
                if ([block.type, scope.block.type].every(type => type === 'Program')) { // only one Program in each tree
                    return true
                }
                if (nodeMatches(scope.block as Node, block)) {
                    return true
                }
            })
        }

        function scopeOrAnyParentIsRequisite(scope: Scope) {
            do {
                if (isRequisiteScope(scope)) return true
                scope = scope.parent
            } while (scope)
            return false
        }

        if (requisiteScopes.size === 0) // no doSomethings
            return
        const doSomethingCalls = Array.from(doSomethingScopeMap.keys())
        const functionComponents = Array.from(doSomethingScopeMap.values()).map(nodes => nodes[0])
        const ast = parser.traverseClonedFile(fileName, {
            enter(nodePath) {
                if ((doSomethingCalls as Node[]).includes(nodePath.node as Node)) {
                    console.log(nodePath.node)
                }
                if (!scopeOrAnyParentIsRequisite(nodePath.scope)) {
                    console.log(nodePath.scope.block)
                    nodePath.scope.path.remove()
                }
            },
            ReturnStatement(nodePath) {
                if (!functionComponents.some(functionComponent =>
                    nodeMatches(functionComponent, nodePath.scope.block as Node)
                )) return
                nodePath.remove()
            },
            ImportDeclaration(nodePath) {
                if (nodePath.node.source.value.match(/\.s?[ac]ss$/))
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
    })

    return clientModules
}
