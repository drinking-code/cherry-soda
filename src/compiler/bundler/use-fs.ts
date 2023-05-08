import path from 'path'
import fs from 'fs'

import type {OnResolveArgs, Plugin} from 'esbuild'
import resolveFile from '../helpers/resolve-file'
import {isObject} from '../../utils/object'

type ImportSubPath = {
    bun?: string,
    node?: string,
    default?: string
}

export interface UseFsOptions {
    fs?: any
    defaultImports?: { [importPath: string]: string | ImportSubPath }
}

let optionsStorage: UseFsOptions

export function useFs(options: UseFsOptions): Plugin {
    optionsStorage = options
    const resolveFileExt = filePath => resolveFile(path.dirname(filePath), path.basename(filePath), options.fs)
    return {
        name: 'use-fs',
        setup(builder) {
            builder.onResolve({filter: /^(\.\.?)?\//}, args => {
                if (['./', '../'].some(prefix => args.path.startsWith(prefix))) {
                    const concatenatedPath = path.join(args.resolveDir, args.path)
                    const resolvedPath = resolveFileExt(concatenatedPath)
                    return {path: resolvedPath}
                } else if (args.path.startsWith('/')) {
                    return {path: resolveFileExt(args.path)}
                } else {
                    return undefined
                }
            })
            builder.onResolve({filter: /^[a-z]/}, args => {
                if (args.path.match(/^https?:\/\//)) return
                const packageDir = path.join('/node_modules', args.path)
                const packageJsonPath = path.join(packageDir, 'package.json')
                const packageJson = options.fs.readFileSync(packageJsonPath, 'utf8')
                const relativeMainJsPath = JSON.parse(packageJson).main
                const mainJsPath = path.join(packageDir, relativeMainJsPath)
                return {path: mainJsPath}
            })
            builder.onResolve({filter: /^#/}, args => {
                let packageDir = path.dirname(args.importer)
                while (!options.fs.readdirSync(packageDir).includes('package.json')) {
                    packageDir = path.join(packageDir, '..')
                    if (packageDir === '/') {
                        packageDir = null
                        break
                    }
                }
                let packageJsonPath, packageJson, packageImports
                if (!packageDir) {
                    packageImports = options.defaultImports
                } else {
                    packageJsonPath = path.join(packageDir, 'package.json')
                    packageJson = options.fs.readFileSync(packageJsonPath, 'utf8')
                    packageImports = JSON.parse(packageJson).imports
                }
                let importPath = packageImports[args.path]
                if (isObject(importPath))
                    importPath = importPath.default
                const resolvedPath = packageDir ? path.join(packageDir, importPath) : importPath.replace(/^\.\/src/, '')
                return {path: resolvedPath}
            })
            builder.onLoad({filter: /./}, loadFs.bind(loadFs, options))
        }
    }
}

export function loadFs(options: UseFsOptions, args: OnResolveArgs, readOptions: Parameters<typeof fs.readFileSync>[1]) {
    options ??= optionsStorage
    const contents = options.fs.existsSync(args.path)
        ? options.fs.readFileSync(args.path, readOptions)
        : fs.readFileSync(args.path, readOptions)
    return {
        contents: contents,
        loader: 'default',
    }
}
