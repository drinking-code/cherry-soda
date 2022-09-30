import esbuild from 'esbuild'
import PrettyError from 'pretty-error'

import appRoot from '../utils/project-root.js'
import {entryPoint, extendBaseConfig} from './base.js'
import {imageLoader} from '../imports/images.js'
import buildFileTreeOfComponentsOnly from './plugins/BuildFileTreeOfComponentsOnly.js'
import {runModuleBuilder} from './module-compiler/index.ts'
import {restartRenderer} from '#render-function'
import ExternaliseNodeModulesPlugin from './plugins/ExternaliseNodeModulesPlugin.js'

export const outputPath = appRoot.resolve('node_modules', '.cache', 'cherry-cola', 'server')
const pe = new PrettyError()

export const endEventListener = new EventTarget()
const endEvent = new CustomEvent('end')

esbuild.build(extendBaseConfig({
    target: 'node16', // todo: use current node version
    platform: 'node',
    format: 'esm',
    outExtension: {'.js': '.mjs'},
    entryPoints: {
        App: entryPoint,
    },
    outdir: outputPath,
    plugins: [
        imageLoader({emit: false}),
        buildFileTreeOfComponentsOnly(),
        {
            name: 'renderend-event',
            setup(build) {
                build.onEnd(async () => {
                    await Promise.all([
                        runModuleBuilder(),
                        restartRenderer(outputPath)
                    ])
                    endEventListener.dispatchEvent(endEvent)
                })
            }
        },
        ExternaliseNodeModulesPlugin
    ],
    watch: process.env.BUN_ENV === 'development' && {
        onRebuild(error) {
            if (error)
                console.log(pe.render(error))
        },
    },
}))