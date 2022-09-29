import path from 'path'
import fs from 'fs'
import esbuild from 'esbuild'
import PrettyError from 'pretty-error'

import appRoot from '../utils/project-root.js'
import {entryPoint, extendBaseConfig} from './base.js'
import {imageLoader} from '../imports/images.js'
import buildFileTreeOfComponentsOnly from './plugins/BuildFileTreeOfComponentsOnly.js'
import {runModuleBuilder} from './module-compiler/index.ts'
import ExternaliseNodeModulesPlugin from './plugins/ExternaliseNodeModulesPlugin.js'

const dirname = path.dirname((new URL(import.meta.url)).pathname)
export const outputPath = appRoot.resolve(path.join('node_modules', '.cache', 'cherry-cola', 'server'))
const pe = new PrettyError()

function findTsconfig() {
    let currentDirname = dirname
    while (!fs.readdirSync(currentDirname).includes('tsconfig.json'))
        currentDirname = path.join(currentDirname, '..')
    return path.join(currentDirname, 'tsconfig.json')
}

esbuild.build(extendBaseConfig({
    target: 'node16', // todo: use current node version
    platform: 'node',
    format: 'esm',
    outExtension: {'.js': '.mjs'},
    entryPoints: {
        App: entryPoint,
    },
    outdir: outputPath,
    // tsconfig: findTsconfig(),
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
        ExternaliseNodeModulesPlugin
    ],
    watch: process.env.BUN_ENV === 'development' && {
        onRebuild(error) {
            if (error)
                console.log(pe.render(error))
        },
    },
}))
