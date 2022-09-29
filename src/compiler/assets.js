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

export const outputPath = appRoot.resolve(path.join('node_modules', '.cache', 'cherry-cola', 'client'))
const dirname = path.dirname((new URL(import.meta.url)).pathname)
const pe = new PrettyError()

;(async () => {
    const ipos = await iposPromise
    ipos.create('clientAssets', ['main.js', 'main.css'])
})()

const label = 'client-side'
// todo: node: start only after initial node build
// todo: clear modulesJsPath before initial build to remove previous errors
esbuild.build(extendBaseConfig({
    entryPoints: [path.join(dirname, '..', 'runtime', 'index.js')],
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
