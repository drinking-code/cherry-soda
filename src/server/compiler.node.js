import path from 'path'
import webpack from 'webpack'

import appRoot from 'app-root-path'
import {baseConfig} from './compiler.base.js'

export const outputPath = appRoot.resolve(path.join('node_modules', '.cache', 'cherry-cola', 'server'))

webpack({
    ...baseConfig,
    target: 'node16',
    output: {
        path: outputPath,
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
