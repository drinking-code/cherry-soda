import path from 'path'
import fs from 'fs'
import webpack from 'webpack'
import PrettyError from 'pretty-error'

import autoprefixer from 'autoprefixer'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

import appRoot from 'app-root-path'

import {extendBaseConfig} from './base.js'
import {showCompilationStatus} from './logger.js'
import {reportNewAsset} from '../dynamic-code-synchronisation/report.js'
import GetChangedFilesPlugin from './GetChangedFilesPlugin.js'

export const outputPath = appRoot.resolve(path.join('node_modules', '.cache', 'cherry-cola', 'client'))
const pe = new PrettyError()

const postcssAndSass = [{
    loader: 'postcss-loader',
    options: {
        sourceMap: true,
        postcssOptions: {
            plugins: [autoprefixer],
        },
    }
}, {
    loader: 'resolve-url-loader',
    options: {
        sourceMap: true,
    }
}, {
    loader: 'sass-loader',
    options: {
        sourceMap: true,
    }
},]
const compiler = webpack(extendBaseConfig({
    target: 'web',
    output: {
        path: outputPath,
        filename: '_remove_me.js',
        clean: {
            keep: /\.js$/,
        }
    },
    module: {
        rules: [{
            test: /\.(png|svg)$/i,
            type: 'asset/resource',
        }, {
            test: /\.s?[ac]ss$/i,
            exclude: /\.module\.s?[ac]ss$/i,
            use: [{
                loader: MiniCssExtractPlugin.loader,
            }, {
                loader: 'css-loader',
                options: {
                    importLoaders: postcssAndSass.length,
                    sourceMap: true,
                }
            }, ...postcssAndSass]
        },],
    },
    plugins: [
        new GetChangedFilesPlugin(reportNewAsset),
        new MiniCssExtractPlugin({
            filename: 'style.css',
        }),
    ],
}))

if (!global['cherry-cola'])
    global['cherry-cola'] = {}

compiler.watch({}, async (err, stats) => {
    const statsJson = stats.toJson()
    global['cherry-cola'].assetsStats = statsJson

    const jsFileName = '_remove_me.js'
    const jsFilePath = path.join(outputPath, jsFileName)
    if (fs.existsSync(jsFilePath))
        await fs.rmSync(jsFilePath)

    let assets = global['cherry-cola'].clientAssets
    if (!assets) assets = global['cherry-cola'].clientAssets = []
    assets.forEach((asset, index) => {
        if (asset.from === 'assets-compiler')
            delete assets[index]
    })
    const newAssets = statsJson.assets
        .filter(asset => !asset.name.endsWith(jsFileName))
    assets.push(
        ...newAssets
            .map(asset => {
                asset.from = 'assets-compiler'
                return asset
            })
    )

    if (err)
        console.log(pe.render(err))
})

;(async () => {
    showCompilationStatus(
        typeof Bun !== 'undefined' ? label
            : (await import('chalk')).default.bgHex('#006434').hex('#ddd')(' assets '),
        compiler,
        'assetsStats'
    )
})()
