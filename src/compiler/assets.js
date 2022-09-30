import path from 'path'
import esbuild from 'esbuild'
import PrettyError from 'pretty-error'

import appRoot from '../utils/project-root.js'

import {extendBaseConfig} from './base.js'
import {showCompilationStatus} from './helpers/logger.js'
import {reportNewAsset} from '../server/dynamic-code-synchronisation/report.js'
import {imageLoader} from '../imports/images.js'
import {outputPath as modulesJsPath} from './module-compiler/index'
import {default as iposPromise} from '../ipos.js'
import moduleRoot from '../utils/module-root.js'

export const outputPath = appRoot.resolve('node_modules', '.cache', 'cherry-cola', 'client')
const pe = new PrettyError()

const ipos = await iposPromise
ipos.create('clientAssets', ['main.js', 'main.css'])

const label = 'client-side'

// todo: clear modulesJsPath before initial build to remove previous errors
esbuild.build(extendBaseConfig({
    entryPoints: [moduleRoot.resolve('src', 'runtime', 'index.js')],
    inject: [modulesJsPath],
    outfile: path.join(outputPath, 'main.js'),
    plugins: [
        imageLoader({path: outputPath}),
        showCompilationStatus(typeof Bun !== 'undefined' ? label
            : (await import('chalk')).default.bgBlue(` ${label} `)
        ),
    ],
    watch: process.env.BUN_ENV === 'development' && {
        async onRebuild(error, result) {
            if (error)
                console.log(pe.render(error))
        },
    },
}))
