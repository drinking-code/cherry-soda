// code and assets compiler for frontend and backend
// this (backend) will be obsolete and should be replaced when bun has esbuild's onLoad / onResolve todo

import path from 'path'
import fs from 'fs'
import webpack from 'webpack'

import autoprefixer from 'autoprefixer'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

import ora from 'ora'
import chalk from 'chalk'

const isProduction = false
const baseConfig = {
    mode: isProduction ? 'production' : 'development',
    entry: path.resolve('./example/cra-template/index.jsx'),
    output: {
        filename: 'main.js',
        clean: true,
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    module: {
        rules: [{
            test: /\.[jt]sx?$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-typescript'],
                    plugins: [
                        ["@babel/plugin-transform-react-jsx", {
                            runtime: 'automatic',
                            importSource: '/src',
                        }]
                    ]
                }
            }
        },],
    },
}

webpack({
    ...baseConfig,
    target: 'node16',
    devtool: 'source-map',
    output: {
        path: path.resolve('.cc', 'server'),
        library: {
            type: 'module',
        },
    },
    module: {
        rules: [...baseConfig.module.rules, {
            test: /\.(png|svg)$/i,
            type: 'asset/resource',
            generator: {
                publicPath: '/',
                emit: false,
            }
        }, {
            test: /\.css$/i,
            use: ['css-loader'],
        },],
    },
    experiments: {
        outputModule: true,
    },
}).watch({}, () => 0)


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
    devtool: 'inline-source-map',
    output: {
        path: path.resolve('.cc', 'client'),
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
compiler.watch({}, async (err, stats) => {
    const jsFile = path.resolve('.cc', 'client', 'main.js')
    if (fs.existsSync(jsFile))
        await fs.rmSync(jsFile)
})

let wasRunning = false, runningMessage, startingTime
setInterval(() => {
    // started running
    if (!compiler.idle && !wasRunning) {
        // show compiling in console
        startingTime = Date.now()
        runningMessage = ora(
            chalk.blue(`webpack: `) +
            'Compiling changes'
        ).start()
        runningMessage.color = 'cyan'
    } else // stopped running
    if (compiler.idle && wasRunning) {
        const duration = Date.now() - startingTime
        // stop showing compiling in console
        // show compiling complete in console
        runningMessage.stopAndPersist({
            text: chalk.blue(`webpack: `) +
                'Compiled changes in ' +
                chalk.bold(`${duration} ms`),
            symbol: chalk.green('✓')
        })
        runningMessage = null
    }
    wasRunning = !compiler.idle
}, 1)
