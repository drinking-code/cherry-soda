import path from 'path'
import createHybridFs from 'hybridfs'
import webpack from 'webpack'
import PrettyError from 'pretty-error'

import appRoot from 'app-root-path'

import {baseConfig} from './compiler.base.js'
import {showCompilationStatus} from './compiler.logger.js'

export const outputPath = appRoot.resolve(path.join('node_modules', '.cache', 'cherry-cola', 'client'))
const dirname = (new URL(import.meta.url)).pathname.replace(/\/[^/]+$/, '')
const pe = new PrettyError()

const hfs = createHybridFs([
    appRoot.resolve('node_modules'),
    path.join(dirname, '..', '..', 'package.json'),
    [path.join(dirname, '../runtime'), '/runtime'],
])
hfs.mkdirSync('/app')
hfs.mkdirSync('/out')

const compiler = webpack({
    ...baseConfig,
    target: 'web',
    entry: ['/runtime/index.js'],
    output: {
        ...baseConfig.output,
        filename: 'main.js',
        path: outputPath,
        clean: {
            keep: (name) => !name.endsWith('.js')
        },
    },
})

if (!global['cherry-cola'])
    global['cherry-cola'] = {}

compiler.inputFileSystem = hfs
compiler.watch({}, async (err, stats) => {
    let assets = global['cherry-cola'].clientAssets
    if (!assets) assets = global['cherry-cola'].clientAssets = []
    assets.forEach((asset, index) => {
        if (asset.from === 'javascript-compiler')
            delete assets[index]
    })
    assets.push(
        ...stats.toJson().assets.map(asset => {
            asset.from = 'javascript-compiler'
            return asset
        })
    )

    global['cherry-cola'].jsStats = stats.toJson()
})

;(async () => {
    if (typeof Bun !== 'undefined') { // todo: remove when chalk works on bun
        showCompilationStatus(
            'javascript',
            compiler,
            'jsStats'
        )
    } else {
        const chalk = (await import('chalk')).default
        showCompilationStatus(
            chalk.bgHex('#c09a00').black(' javascript '),
            compiler,
            'jsStats'
        )
    }
})()
