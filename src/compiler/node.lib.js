import path from 'path'
import esbuild from 'esbuild'
import PrettyError from 'pretty-error'

import {extendBaseConfig} from './base.js'
import resolveFile from './helpers/resolve-file.js'

const dirname = path.dirname((new URL(import.meta.url)).pathname)
export const outputPath = path.join(dirname, '..', '..', 'lib')
const pe = new PrettyError()

let resolveReadyPromise
export const readyPromise = new Promise(resolve => resolveReadyPromise = resolve)

const config = extendBaseConfig({
    target: 'node16', // todo: use current node version
    platform: 'node',
    format: 'esm',
    entryPoints: {
        'cherry-cola': path.join(dirname, '..', 'index.ts'),
        'compiler': path.join(dirname, '..', 'compiler', 'node.app.js'),
        'render': path.join(dirname, '..', 'server', 'render.js'),
        'renderer': path.join(dirname, '..', 'server', 'renderer.js'),
        'module-collector': path.join(dirname, '..', 'compiler', 'module-compiler', 'module-collector.js'),
    },
    outdir: outputPath,
    watch: process.env.BUN_ENV === 'development' && {
        onRebuild(error) {
            if (error)
                console.log(pe.render(error))
        },
    },
})

delete config.plugins
config.plugins = [{
    name: 'test',
    setup(build) {
        build.onResolve({filter: /./}, args => {
            const isAbsolute = args.path.startsWith('/')
            const isModule = !args.path.startsWith('.') && !isAbsolute
            if (args.kind === 'entry-point')
                args.path = args.path.replace(/\/cherry-cola\/(src\/)?/, '/cherry-cola/src/')
            return {
                path: !isModule ? (
                        isAbsolute
                            ? args.path
                            : resolveFile(args.resolveDir, args.path)
                    ) : args.path,
                external: isModule
            }
        })

        build.onEnd(() => {
            resolveReadyPromise()
        })
    }
}]
esbuild.build(config)
