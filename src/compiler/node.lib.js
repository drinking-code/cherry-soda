import esbuild from 'esbuild'
import PrettyError from 'pretty-error'

import {extendBaseConfig} from './base.js'
import console from '../utils/console.js'
import ExternaliseNodeModulesPlugin from './plugins/ExternaliseNodeModulesPlugin.js'
import moduleRoot from '../utils/module-root.js'

export const outputPath = moduleRoot.resolve('lib')
const pe = new PrettyError()

export const config = extendBaseConfig({
    target: 'node16', // todo: use current node version
    platform: 'node',
    format: 'esm',
    entryPoints: {
        'cherry-cola': moduleRoot.resolve('src', 'index.ts'),
        'compiler': moduleRoot.resolve('src', 'compiler', 'node.app.js'),
        'render': moduleRoot.resolve('src', 'server', 'render.js'),
        'renderer': moduleRoot.resolve('src', 'server', 'renderer.js'),
        'iterate-function-components': moduleRoot.resolve('src', 'compiler', 'module-compiler', 'iterate-function-components.ts'),
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
config.plugins = [ExternaliseNodeModulesPlugin]
export default async function () {
    await esbuild.build(config)
}
