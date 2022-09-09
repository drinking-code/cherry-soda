import path from 'path'
import fs from 'fs'
import esbuild from 'esbuild'
import postCssPlugin from '@deanc/esbuild-plugin-postcss'
import PrettyError from 'pretty-error'

import autoprefixer from 'autoprefixer'

import appRoot from 'app-root-path'

import {extendBaseConfig} from './base.js'
import {showCompilationStatus} from './logger.js'
import {reportNewAsset} from '../dynamic-code-synchronisation/report.js'
import GetChangedFilesPlugin from './GetChangedFilesPlugin.js'

export const outputPath = appRoot.resolve(path.join('node_modules', '.cache', 'cherry-cola', 'client'))
const pe = new PrettyError()

if (!global['cherry-cola'])
    global['cherry-cola'] = {}

const label = 'assets'
esbuild.build(extendBaseConfig({
    outfile: path.join(outputPath, '_remove_me.js'),
    plugins: [
        postCssPlugin({
            plugins: [autoprefixer],
        }),
        showCompilationStatus(typeof Bun !== 'undefined' ? label
            : (await import('chalk')).default.bgHex('#006434').hex('#ddd')(' ' + label + ' ')
        ),
    ],
    watch: process.env.BUN_ENV === 'development' && {
        async onRebuild(error, result) {
            console.log(result)
            // const statsJson = stats.toJson()
            // global['cherry-cola'].assetsStats = statsJson

            const jsFileName = '_remove_me.js'
            const jsFilePath = path.join(outputPath, jsFileName)
            if (fs.existsSync(jsFilePath))
                await fs.rmSync(jsFilePath)

            // let assets = global['cherry-cola'].clientAssets
            // if (!assets) assets = global['cherry-cola'].clientAssets = []
            /*assets.forEach((asset, index) => {
                if (asset.from === 'assets-compiler')
                    delete assets[index]
            })*/
            // const newAssets = statsJson.assets
            //     .filter(asset => !asset.name.endsWith(jsFileName))
            /*assets.push(
                ...newAssets
                    .map(asset => {
                        asset.from = 'assets-compiler'
                        return asset
                    })
            )*/

            if (error)
                console.log(pe.render(error))
        },
    },
}))
