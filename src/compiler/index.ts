import {Volume} from 'memfs/lib/volume'

import Parser from './parser'
import {possibleExtensions} from './helpers/resolve-file'
import {resolve as resolveProjectRoot} from '../utils/project-root'
import generateClientScriptTrees from './client-script'
import {resolve as resolveModuleRoot} from '../utils/module-root'
import collectAssetsFilePaths from './assets'
import bundleVirtualFiles, {outputPath} from './bundler'
import extractTemplates from './template'
import {getRenderer} from '../renderer/renderer'
import {addMarker} from './profiler'

export default function compile(entry: string): { outputPath: string, fs: Promise<Volume>, render: () => string } {
    let resolveVolumeAndPathPromise
    const volumeAndPathPromise = new Promise<{ outputPath: string, fs: Volume }>(resolve => resolveVolumeAndPathPromise = resolve)
    extractTemplates(entry, volumeAndPathPromise)
    const render = getRenderer()
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
    addMarker('parser', 'start')
    parseFileAndAllImportedFiles(entry)
    addMarker('parser', 'end')
    const clientScriptTrees = generateClientScriptTrees(parser)
    const assetsFilePaths = collectAssetsFilePaths(parser)
    const volumePromise = bundleVirtualFiles(clientScriptTrees, assetsFilePaths)
    volumePromise.then(volume => resolveVolumeAndPathPromise({outputPath, fs: volume}))
    return {outputPath, fs: volumePromise, render}
}
