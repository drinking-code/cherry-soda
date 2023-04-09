import fs from 'fs'

import {Volume} from 'memfs/lib/volume'

import collectAssetsFilePaths, {getAllCurrentFiles} from './assets'
import bundleVirtualFiles from './bundler'
import extractTemplates, {waitForTemplates} from './template'
import {getVolume, outputPath} from './client-script/volume'
import * as fsPoly from '../utils/temp-watch-polyfill'

export default function compile(entry: string, watch: boolean = false): { outputPath: string, fs: Volume } {
    if (watch) {
        if (!global.cherrySoda.compiler.watching) {
            startWatch(entry)
        }
    } else {
        runCompiler(entry)
    }
    return {outputPath, fs: getVolume()}
}

if (!global.cherrySoda)
    global.cherrySoda = {}

if (!global.cherrySoda.compiler)
    global.cherrySoda.compiler = {}

global.cherrySoda.compiler.watching ??= false

async function startWatch(entry: string) {
    global.cherrySoda.compiler.watching = true
    runCompiler(entry)
    getAllCurrentFiles().forEach(filename =>
        fsPoly.watch(filename, () => runCompiler(entry))
    )
}

function runCompiler(entry: string) {
    extractTemplates(entry)
    collectAssetsFilePaths(entry)
    waitForTemplates().then(bundleVirtualFiles)
}
