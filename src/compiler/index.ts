import {Volume} from 'memfs/lib/volume'

import collectAssetsFilePaths from './assets'
import bundleVirtualFiles from './bundler'
import extractTemplates, {waitForTemplates} from './template'
import {getVolume, outputPath} from './client-script/generate-data-files'

export default function compile(entry: string): { outputPath: string, fs: Volume } {
    extractTemplates(entry)
    collectAssetsFilePaths(entry)
    waitForTemplates().then(bundleVirtualFiles)
    return {outputPath, fs: getVolume()}
}
