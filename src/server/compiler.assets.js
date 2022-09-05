import path from 'path'
import fs from 'fs'
import webpack from 'webpack'
import PrettyError from 'pretty-error'

import autoprefixer from 'autoprefixer'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

import appRoot from 'app-root-path'

import {baseConfig} from './compiler.base.js'
import {showCompilationStatus} from './compiler.logger.js'

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
const compiler = webpack({
    ...baseConfig,
    target: 'web',
    output: {
        ...baseConfig.output,
        path: outputPath,
        filename: '_remove_me.js',
        clean: {
            keep: /\.js$/,
        }
    },
    module: {
        rules: [...baseConfig.module.rules, {
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
        new MiniCssExtractPlugin({
            filename: 'style.css',
        }),
    ],
})

if (!global['cherry-cola'])
    global['cherry-cola'] = {}

compiler.watch({}, async (err, stats) => {
    global['cherry-cola'].currentStats = stats.toJson()
    const jsFileName = '_remove_me.js'
    const jsFilePath = path.join(outputPath, jsFileName)

    let assets = global['cherry-cola'].clientAssets
    if (!assets) assets = global['cherry-cola'].clientAssets = []
    assets.forEach((asset, index) => {
        if (asset.from === 'assets-compiler')
            delete assets[index]
    })
    assets.push(
        ...stats.toJson().assets
            .filter(asset => !asset.name.endsWith(jsFileName))
            .map(asset => {
                asset.from = 'assets-compiler'
                return asset
            })
    )

    if (fs.existsSync(jsFilePath))
        await fs.rmSync(jsFilePath)
    if (err)
        console.log(pe.render(err))
})

;(async () => {
    if (typeof Bun !== 'undefined') { // todo: remove when chalk works on bun
        showCompilationStatus(
            'assets',
            compiler,
            'currentStats'
        )
    } else {
        const chalk = (await import('chalk')).default
        showCompilationStatus(
            chalk.bgHex('#006434').hex('#ddd')(' assets '),
            compiler,
            'currentStats'
        )
    }
})()
