import path from 'path'
import createHybridFs from 'hybridfs'
import webpack from 'webpack'
import PrettyError from 'pretty-error'

import appRoot from 'app-root-path'

import {baseConfig} from './compiler.base.js'

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

compiler.inputFileSystem = hfs
// compiler.outputFileSystem = hfs
compiler.watch({}, async (err, stats) => {
    stats.toJson().assets.map(asset => path.join('/out', asset.name))
})
