import esbuild from 'esbuild'
import PrettyError from 'pretty-error'

import appRoot from '../utils/project-root.js'
import {entryPoint, extendBaseConfig} from './base.js'
import {imageLoader} from '../imports/images.js'
import buildFileTreeOfComponentsOnly from './plugins/BuildFileTreeOfComponentsOnly.js'
import {runModuleBuilder} from './module-compiler/index.ts'
import packageJson from '../../package.json'
import moduleRoot from '../utils/module-root.js'
import {config as libConfig} from './node.lib.js'

export const outputPath = appRoot.resolve('node_modules', '.cache', 'cherry-cola', 'server')
const pe = new PrettyError()

esbuild.build(extendBaseConfig({
    target: 'node16', // todo: use current node version
    platform: 'node',
    format: 'esm',
    outExtension: {'.js': '.mjs'},
    entryPoints: {
        App: entryPoint,
    },
    outdir: outputPath,
    jsxImportSource: 'src',
    plugins: [
        imageLoader({emit: false}),
        buildFileTreeOfComponentsOnly(),
        {
            name: 'renderend-event',
            setup(build) {
                build.onEnd(runModuleBuilder)
            }
        },
        {
            name: 'externalise-package-exports-plugin',
            setup(build) {
                build.onResolve({filter: /^#/}, args => {
                    args.path = moduleRoot.resolve(packageJson.imports[args.path])
                    const entryKey = new Map(
                        Array.from(Object.entries(libConfig.entryPoints))
                            .map(([a, b]) => [b, a])
                    ).get(args.path)

                    return {
                        path: entryKey
                            ? (args.resolveDir.replace(/\/cherry-cola\/.*$/, '/cherry-cola/lib/') + entryKey + '.js')
                            : args.path,
                        external: true
                    }
                })
            }
        }
    ],
    watch: process.env.BUN_ENV === 'development' && {
        onRebuild(error) {
            if (error)
                console.log(pe.render(error))
        },
    },
}))
