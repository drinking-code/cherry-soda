import esbuild from 'esbuild'
import PrettyError from 'pretty-error'

import {extendBaseConfig} from './base.js'
import console from '../utils/console.js'
import ExternaliseNodeModulesPlugin from './plugins/ExternaliseNodeModulesPlugin.js'
import moduleRoot from '../utils/module-root.js'
import {entryPoints} from './helpers/node.lib-entries.js'

export const outputPath = moduleRoot.resolve('lib')
const pe = new PrettyError()

export const config = extendBaseConfig({
    target: 'node16', // todo: use current node version
    platform: 'node',
    format: 'esm',
    entryPoints,
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
