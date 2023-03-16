import {Volume} from 'memfs/lib/volume'

import Parser from './parser'
import {possibleExtensions} from './helpers/resolve-file'
import {resolve as resolveProjectRoot} from '../utils/project-root'
import generateClientScriptTrees from './client-script'
import {resolve as resolveModuleRoot} from '../utils/module-root'
import collectAssetsFilePaths from './assets'
import bundleVirtualFiles from './bundler'
import extractTemplates from './template'
import {getRenderer} from '../renderer/renderer'

export default function compile(entry: string): { outputPath: string, fs: Volume, render: () => string } {
    let resolveVolumeAndPathPromise
    const volumeAndPathPromise = new Promise<ReturnType<typeof bundleVirtualFiles>>(resolve => resolveVolumeAndPathPromise = resolve)
    const templatePromise = extractTemplates(entry, volumeAndPathPromise)
    const render = getRenderer(templatePromise)
    const parser = new Parser()
    const parseFileAndAllImportedFiles = filePath => {
        parser.parseFile(filePath)
        const imports = parser.getImports(filePath)
        const filePaths = Array.from(Object.keys(imports)
            .filter(filename => {
                return possibleExtensions.some(extension => filename.endsWith(extension)) &&
                    !filename.startsWith(resolveProjectRoot('node_module')) &&
                    !filename.startsWith(resolveModuleRoot('src')) // only needed during development on cc
            }))
        return filePaths.map(parseFileAndAllImportedFiles)
    }
    parseFileAndAllImportedFiles(entry)
    const clientScriptTrees = generateClientScriptTrees(parser)
    const assetsFilePaths = collectAssetsFilePaths(parser)
    const volumeAndPath = bundleVirtualFiles(clientScriptTrees, assetsFilePaths, templatePromise)
    resolveVolumeAndPathPromise(volumeAndPath)
    return {...volumeAndPath, render}
}
