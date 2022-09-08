import path from 'path'
import createHybridFs from 'hybridfs'
import webpack from 'webpack'
import PrettyError from 'pretty-error'

import appRoot from 'app-root-path'

import {extendBaseConfig} from './base.js'
import {showCompilationStatus} from './logger.js'
import GetChangedFilesPlugin from './GetChangedFilesPlugin.js'
import {reportNewAsset, reportNewScripts} from '../dynamic-code-synchronisation/report.js'

export const outputPath = appRoot.resolve(path.join('node_modules', '.cache', 'cherry-cola', 'client'))
const dirname = (new URL(import.meta.url)).pathname.replace(/\/[^/]+$/, '')
const pe = new PrettyError()

const hfs = createHybridFs([
    appRoot.resolve('node_modules'),
    path.join(dirname, '..', '..', '..', 'package.json'),
    [path.join(dirname, '..', '..', 'runtime'), '/runtime'],
])
hfs.mkdirSync('/app')
hfs.mkdirSync('/out')

const compiler = webpack(extendBaseConfig({
    target: 'web',
    entry: ['/runtime/index.js'],
    output: {
        filename: 'main.js',
        path: outputPath,
        clean: {
            keep: (name) => !name.endsWith('.js')
        },
    },
    plugins: [
        new GetChangedFilesPlugin(reportNewScripts),
    ]
}))

if (!global['cherry-cola'])
    global['cherry-cola'] = {}

compiler.inputFileSystem = hfs
compiler.watch({}, async (err, stats) => {
    if (!stats) return

    const statsJson = stats.toJson()
    global['cherry-cola'].jsStats = statsJson

    let assets = global['cherry-cola'].clientAssets
    if (!assets) assets = global['cherry-cola'].clientAssets = []
    assets.forEach((asset, index) => {
        if (asset.from === 'javascript-compiler')
            delete assets[index]
    })
    assets.push(
        ...statsJson.assets.map(asset => {
            asset.from = 'javascript-compiler'
            return asset
        })
    )
})

;(async () => {
    showCompilationStatus(
        typeof Bun !== 'undefined' ? label
            : (await import('chalk')).default.bgHex('#c09a00').black(' javascript '),
        compiler,
        'jsStats'
    )
})()
