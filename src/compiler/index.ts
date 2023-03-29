import {Volume} from 'memfs/lib/volume'

import Parser from './parser'
import {possibleExtensions} from './helpers/resolve-file'
import {resolve as resolveProjectRoot} from '../utils/project-root'
import generateClientScriptTrees from './client-script'
import {resolve as resolveModuleRoot} from '../utils/module-root'
import collectAssetsFilePaths from './assets'
import bundleVirtualFiles from './bundler'
import extractTemplates, {waitForTemplates} from './template'
import {getVolume, outputPath} from './client-script/generate-data-files'

export default function compile(entry: string): { outputPath: string, fs: Volume } {
    extractTemplates(entry)
    const parser = new Parser()
    // generateClientScriptTrees(parser)
    collectAssetsFilePaths(entry)
    waitForTemplates().then(bundleVirtualFiles)
    return {outputPath, fs: getVolume()}
}
