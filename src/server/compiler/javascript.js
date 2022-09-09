import path from 'path'
import esbuild from 'esbuild'
import PrettyError from 'pretty-error'

import appRoot from 'app-root-path'

import {extendBaseConfig} from './base.js'
import {showCompilationStatus} from './logger.js'
import GetChangedFilesPlugin from './GetChangedFilesPlugin.js'
import {reportNewAsset, reportNewScripts} from '../dynamic-code-synchronisation/report.js'

export const outputPath = appRoot.resolve(path.join('node_modules', '.cache', 'cherry-cola', 'client'))
const dirname = (new URL(import.meta.url)).pathname.replace(/\/[^/]+$/, '')
const pe = new PrettyError()

if (!global['cherry-cola'])
    global['cherry-cola'] = {}

const label = 'javascript'
esbuild.build(extendBaseConfig({
    entryPoints: [path.join(dirname, '..', '..', 'runtime', 'index.js')],
    outdir: outputPath,
    plugins: [
        showCompilationStatus(typeof Bun !== 'undefined' ? label
            : (await import('chalk')).default.bgHex('#c09a00').black(' ' + label + ' ')
        ),
    ],
    watch: process.env.BUN_ENV === 'development' && {
        async onRebuild(error, result) {
            // if (!stats) return

            // const statsJson = stats.toJson()
            // global['cherry-cola'].jsStats = statsJson

            // let assets = global['cherry-cola'].clientAssets
            // if (!assets) assets = global['cherry-cola'].clientAssets = []
            /*assets.forEach((asset, index) => {
                if (asset.from === 'javascript-compiler')
                    delete assets[index]
            })*/
            /*assets.push(
                ...statsJson.assets.map(asset => {
                    asset.from = 'javascript-compiler'
                    return asset
                })
            )*/
        }
    }
}))
