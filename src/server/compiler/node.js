import path from 'path'
import esbuild from 'esbuild'
import PrettyError from 'pretty-error'

import appRoot from 'app-root-path'
import {baseConfig, extendBaseConfig} from './base.js'

export const outputPath = appRoot.resolve(path.join('node_modules', '.cache', 'cherry-cola', 'server'))
const dirname = (new URL(import.meta.url)).pathname.replace(/\/[^/]+$/, '')
const pe = new PrettyError()

esbuild.build(extendBaseConfig({
    target: 'node16', // todo: use current node version
    platform: 'node',
    entryPoints: {
        'cherry-cola': path.join(dirname, '..', '..', 'index.ts'),
        App: baseConfig.entryPoints,
    },
    outdir: outputPath,
    outExtension: {
        '.js': '.mjs'
    },
    format: 'esm',
    watch: process.env.BUN_ENV === 'development' && {
        onRebuild(error, result) {
            if (error)
                console.log(pe.render(error))
        },
    },
}))
