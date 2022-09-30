import fs from 'fs/promises'
import path from 'path'

import babelParser from '@babel/parser'

import console from '../../utils/console.js'
import exportsFunctionComponent from '../helpers/exports-function-component.js'
import getImports from '../helpers/get-imports.ts'
import FileTree, {Import} from '../helpers/FileTree.js'
import resolveFile from '../helpers/resolve-file.js'
import {addImports} from '../module-compiler/index'
import {default as iposPromise} from '../../ipos.js'

const ipos = await iposPromise
if (!ipos.importTrees)
    ipos.create('importTrees', [])

/**
 * Build a file tree with only files that export function components.
 * The file tree may contain files that do not export function components because
 * ALL imports from files that export function components are listed.
 * */
export default function buildFileTreeOfComponentsOnly() {
    return {
        name: 'extract-client-code-plugin',
        async setup(build) {
            const trees = []

            build.onStart(() => {
                trees.splice(0, trees.length)
            })

            build.onLoad({filter: /\.[jt]sx?$/}, async (args) => {
                const fileContents = await fs.readFile(args.path, 'utf8')
                const ast = babelParser.parse(fileContents, {
                    sourceType: 'module',
                    plugins: [
                        'jsx',
                        'typescript',
                    ],
                })
                if (await exportsFunctionComponent(ast)) {
                    const filename = args.path
                    const fileDir = path.dirname(args.path)
                    const imports = getImports(ast)
                        // resolve paths
                        .map(v => {
                            if (v.source.startsWith('.'))
                                v.source = resolveFile(fileDir, v.source)
                            return v
                        })
                        .map(v => new Import(v.source, v.specifiers))

                    if (trees.length === 0 || !trees.map(tree => tree.has(filename)).includes(true)) {
                        trees.push(new FileTree(filename, imports))
                    } else {
                        trees.forEach(tree => tree.addImportsTo(filename, imports))
                    }

                    addImports(filename,
                        Object.fromEntries(
                            imports.map(imp => [imp.fileTree.filename, imp.specifiers])
                        )
                    )

                    // empty array
                    ipos.importTrees.splice(0, ipos.importTrees.length)
                    // update with current entries
                    ipos.importTrees.push(...trees)
                }

                return {
                    contents: fileContents,
                    loader: 'tsx',
                }
            })
        },
    }
}
