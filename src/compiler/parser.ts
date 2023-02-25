import fs from 'fs/promises'
import path from 'path'

import chalk from 'chalk'
import babelParser from '@babel/parser'
import traverse, {Node, NodePath, TraverseOptions} from '@babel/traverse'
import {File, FunctionDeclaration} from '@babel/types'

import '../utils/project-root'
import resolveImportFileSpecifier from './helpers/resolve-import-file-specifier'

export type LocalToImportedMapType = { [localName: string]: string }
export type FileToImportsMapType = { [fromFile: string]: LocalToImportedMapType }

export default class Parser {
    private trees: Map<string, babelParser.ParseResult<File>> = new Map

    get fileNames() {
        return Array.from(this.trees.keys())
    }

    async parseFile(filePath: string) {
        const fileContents = await fs.readFile(filePath, {encoding: 'utf8'})
        const ast = babelParser.parse(fileContents, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
        })
        this.trees.set(filePath, ast)
    }

    getImports(filePath: string): FileToImportsMapType {
        const ast = this.trees.get(filePath)
        const imports: FileToImportsMapType = {}
        traverse(ast, {
            ImportDeclaration(nodePath) {
                const nameMappings = Object.fromEntries(
                    nodePath.node.specifiers.map(specifier => {
                        if (specifier.type === 'ImportNamespaceSpecifier') return [] // todo
                        const importedName = specifier.type === 'ImportDefaultSpecifier'
                            ? 'default'
                            : (specifier.imported.type === 'Identifier' ? specifier.imported.name : specifier.imported.value)
                        return [specifier.local.name, importedName]
                    })
                )
                const fileName = resolveImportFileSpecifier(path.dirname(filePath), nodePath.node.source.value)
                if (!imports.hasOwnProperty(fileName)) imports[fileName] = {}
                imports[fileName] = {...imports[fileName], ...nameMappings}
            },
        })
        return imports
    }

    traverseFile(filePath: string, options: TraverseOptions<Node>) {
        const ast = this.trees.get(filePath)
        traverse(ast, options)
    }

    traverseFunctionComponents(filePath: string, options: TraverseOptions<FunctionDeclaration>) {
        const ast = this.trees.get(filePath)
        let seenFunctions: NodePath<FunctionDeclaration>[] = [], isInsideReturnStatement = 0 // increases with nested return statements
        let functionComponents: NodePath<FunctionDeclaration>[] = [], currentFunctionIsComponent = false

        traverse(ast, {
            enter(nodePath) {
                if (nodePath.isFunctionDeclaration()) seenFunctions.push(nodePath as NodePath<FunctionDeclaration>)
                if (nodePath.isReturnStatement()) isInsideReturnStatement++
                if (nodePath.isJSXElement() && seenFunctions.length === isInsideReturnStatement)
                    currentFunctionIsComponent = true
            },
            exit(nodePath) {
                if (nodePath.isFunctionDeclaration()) seenFunctions.pop()
                if (nodePath.isReturnStatement()) {
                    functionComponents.push(seenFunctions[seenFunctions.length - 1])
                    currentFunctionIsComponent = true
                    isInsideReturnStatement--
                }
            }
        })
        functionComponents.forEach(nodePath =>
            traverse(nodePath.node, options, nodePath.scope, nodePath.state, nodePath.parentPath)
        )
    }

    printFileTree(filePath: string) {
        const ast = this.trees.get(filePath)

        let level = 0, currentNodePath, treeString = ''
        const tab = '│   '
        const rainbowOrder = ['yellowBright', 'green', 'blue', 'red', 'cyan']
        const colorize = (l = level) => chalk[rainbowOrder[l % rainbowOrder.length]]
        const levelSpacer = (level) => Array(level).fill(0).map((a, i) => colorize(i).dim(tab)).join('')

        traverse(ast, {
            enter(nodePath) {
                treeString += "\n"
                treeString += colorize()(levelSpacer(level) + nodePath.type + ' {')
                currentNodePath = nodePath
                level++
            },
            exit(nodePath) {
                level--
                if (currentNodePath !== nodePath) {
                    treeString += "\n"
                    treeString += colorize()(levelSpacer(level) + '} ')
                    treeString += chalk.gray('// ' + nodePath.type)
                } else {
                    treeString += colorize()('} ')
                }
            }
        })
        console.log(treeString)
    }
}
