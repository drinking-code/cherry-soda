import path from 'path'
import esbuild from 'esbuild'
import PrettyError from 'pretty-error'

import appRoot from 'app-root-path'
import {entryPoint, extendBaseConfig} from './base.js'
import {imageLoader} from '../imports/images.js'
import buildFileTreeOfComponentsOnly from './plugins/BuildFileTreeOfComponentsOnly.js'
import {runModuleBuilder} from './module-compiler/index.js'

export const outputPath = appRoot.resolve(path.join('node_modules', '.cache', 'cherry-cola', 'server'))
const dirname = path.dirname((new URL(import.meta.url)).pathname)
const pe = new PrettyError()

esbuild.build(extendBaseConfig({
    target: 'node16', // todo: use current node version
    platform: 'node',
    entryPoints: {
        'cherry-cola': path.join(dirname, '..', 'server.ts'),
        App: entryPoint,
    },
    outdir: outputPath,
    external: ['bun', 'fs', 'crypto'],
    plugins: [
        imageLoader({emit: false}),
        buildFileTreeOfComponentsOnly(),
        {
            name: 'renderend-event',
            setup(build) {
                build.onEnd(runModuleBuilder)
            }
        },
    ],
    watch: process.env.BUN_ENV === 'development' && {
        onRebuild(error, result) {
            if (error)
                console.log(pe.render(error))
        },
    },
}))
