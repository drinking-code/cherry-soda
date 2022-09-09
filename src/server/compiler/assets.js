import path from 'path'
import fs from 'fs'
import esbuild from 'esbuild'
import postCssPlugin from '@deanc/esbuild-plugin-postcss'
import PrettyError from 'pretty-error'

import autoprefixer from 'autoprefixer'

import appRoot from 'app-root-path'

import {entryPoint, extendBaseConfig} from './base.js'
// import {showCompilationStatus} from './logger.js'
import {reportNewAsset} from '../dynamic-code-synchronisation/report.js'
import GetChangedFilesPlugin from './GetChangedFilesPlugin.js'
import {imageLoader} from '../../imports/images.js'

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
        postCssPlugin({
            plugins: [autoprefixer],
        }),
        /*showCompilationStatus(typeof Bun !== 'undefined' ? label
            : (await import('chalk')).default.bgBlue(` ${label} `)
        ),*/
    ],
    watch: process.env.BUN_ENV === 'development' && {
        async onRebuild(error, result) {
            if (error)
                console.log(pe.render(error))
        },
    },
}))
