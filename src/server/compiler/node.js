import path from 'path'
import webpack from 'webpack'
import PrettyError from 'pretty-error'

import appRoot from 'app-root-path'
import {baseConfig, extendBaseConfig} from './base.js'

export const outputPath = appRoot.resolve(path.join('node_modules', '.cache', 'cherry-cola', 'server'))
const dirname = (new URL(import.meta.url)).pathname.replace(/\/[^/]+$/, '')
const pe = new PrettyError()

webpack(extendBaseConfig({
    target: 'node16',
    entry: {
        'cherry-cola': path.join(dirname, '..', '..', 'index.ts'),
        App: baseConfig.entry,
    },
    output: {
        path: outputPath,
        library: {
            type: 'module',
        },
    },
    module: {
        rules: [{
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
})).watch({}, (err, stats) => {
    if (err)
        console.log(pe.render(err))
})
