import path from 'path'
import esbuild from 'esbuild'
import PrettyError from 'pretty-error'

import appRoot from 'app-root-path'

import {entryPoint, extendBaseConfig} from './base.js'
import {showCompilationStatus} from './logger.js'
import {reportNewAsset} from '../dynamic-code-synchronisation/report.js'
import GetChangedFilesPlugin from './GetChangedFilesPlugin.js'
import {imageLoader} from '../../imports/images.js'
import extractClientCodePlugin from './ExtractClientCodePlugin.js'

export const outputPath = appRoot.resolve(path.join('node_modules', '.cache', 'cherry-cola', 'client'))
const dirname = (new URL(import.meta.url)).pathname.replace(/\/[^/]+$/, '')
const pe = new PrettyError()

if (!global['cherry-cola'])
    global['cherry-cola'] = {}

global['cherry-cola'].clientAssets = ['main.js', 'main.css']

const label = 'client-side'
esbuild.build(extendBaseConfig({
    entryPoints: [path.join(dirname, '..', '..', 'runtime', 'index.js')],
    inject: [entryPoint],
    outfile: path.join(outputPath, 'main.js'),
    plugins: [
        imageLoader({path: outputPath}),
        showCompilationStatus(typeof Bun !== 'undefined' ? label
            : (await import('chalk')).default.bgBlue(` ${label} `)
        ),
        extractClientCodePlugin(),
    ],
    watch: process.env.BUN_ENV === 'development' && {
        async onRebuild(error, result) {
            if (error)
                console.log(pe.render(error))
        },
    },
}))
