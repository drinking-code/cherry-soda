import {Volume} from 'memfs/lib/volume'

import Parser from './parser'
import {possibleExtensions} from './helpers/resolve-file'
import {resolve as resolveProjectRoot} from '../utils/project-root'
import generateClientScriptTrees from './client-script'
import {resolve as resolveModuleRoot} from '../utils/module-root'
import collectAssetsFilePaths from './assets'
import bundleVirtualFiles from './bundler'
import extractTemplates from './template'
import {addMarker} from './profiler'
import {getVolume, outputPath} from './client-script/generate-data-files'

export default function compile(entry: string): { outputPath: string, fs: Volume } {
    extractTemplates(entry)
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
    generateClientScriptTrees(parser)
    collectAssetsFilePaths(parser)
    bundleVirtualFiles()
    return {outputPath, fs: getVolume()}
}
