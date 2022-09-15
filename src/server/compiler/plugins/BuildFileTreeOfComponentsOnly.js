import fs from 'fs'
import path from 'path'

import babelParser from '@babel/parser'

import '../../../utils/bun-project-root.js'
import exportsFunctionComponent from '../helpers/exports-function-component.js'
import getImports from '../helpers/get-imports.js'
import FileTree, {Import} from '../helpers/FileTree.js'
import resolveFile from '../helpers/resolve-file.js'

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

            build.onLoad({filter: /\.[jt]sx?$/}, async (args) => {
                const fileContents = await fs.promises.readFile(args.path, 'utf8')
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
                            v.filename = resolveFile(fileDir, v.filename)
                            return v
                        })
                        .map(v => new Import(v.filename, v.specifiers))

                    if (trees.length === 0 || !trees.map(tree => tree.has(filename)).includes(true)) {
                        trees.push(new FileTree(filename, imports))
                    } else {
                        trees.forEach(tree => tree.addImportsTo(filename, imports))
                    }
                }

                // console.log('')
                // trees.forEach(tree => tree.print())

                return {
                    contents: fileContents,
                    loader: 'tsx',
                }
            })
        },
    }
}
