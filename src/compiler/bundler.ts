import path from 'path'

import esbuild, {type BuildOptions, type BuildResult} from 'esbuild'
import browserslist from 'browserslist'

import {useFs} from './bundler/use-fs'
import {assetLoader} from './bundler/asset-loader'
import stylePlugin from './bundler/style-plugin'
import generateClassName from '../utils/generate-css-class-name'
import {addMarker} from './profiler'
import {
    generateClientScriptFile, generateRefsAndTemplatesFile,
    getVolume,
    stateListenersFilePath,
    outputPath, refsAndTemplatesFilePath,
    virtualFilesPath
} from './client-script/generate-data-files'
import {resolveBundlerReadyPromise} from './bundler/bundler-ready-promise'

export const isProduction = process.env.BUN_ENV === 'production'
export const inputFilePath = '/input.js'
const moduleToFileNameMap = new Map()
moduleToFileNameMap.set(stateListenersFilePath, 'state listeners')
moduleToFileNameMap.set(refsAndTemplatesFilePath, 'refs and states')

if (!global.cherrySoda)
    global.cherrySoda = {}

if (!global.cherrySoda.compiler)
    global.cherrySoda.compiler = {}

export default async function bundleVirtualFiles(watch: boolean = false): typeof watch extends true ? Promise<void> : Promise<BuildResult> {
    addMarker('bundler', 'start')
    addMarker('bundler', 'generate-files')
    const hfs = getVolume()
    hfs.writeFileSync(inputFilePath, '')
    generateClientScriptFile()
    generateRefsAndTemplatesFile()
    addMarker('bundler', 'start-esbuild')
    if (watch) {
        if (!global.cherrySoda.compiler.esWatching) {
            global.cherrySoda.compiler.esWatching = true
            global.cherrySoda.compiler.esCtxPromise ??= esbuild.context(getEsbuildOptions())
                .then(ctx => ctx.watch())
        }
    } else {
        return esbuild.build(getEsbuildOptions())
    }
}

const browserslistEsbuildMap = {
    'chrome': 'chrome',
    'edge': 'edge',
    'firefox': 'firefox',
    // 'ie': 'ie',
    'ios_saf': 'ios',
    // 'opera': 'opera',
    'safari': 'safari',
}

global.cherrySoda.compiler.esWatching ??= false

function getEsbuildOptions(): BuildOptions {
    return {
        entryPoints: [inputFilePath],
        inject: [path.join('/', 'runtime', 'index.ts'), stateListenersFilePath, refsAndTemplatesFilePath],
        outfile: path.join(outputPath, 'main.js'),
        target: browserslist('> 1%, not dead') // todo: make a changeable option
            .map(browser => {
                const browserArray = browser.split(' ')
                const browserName = browserslistEsbuildMap[browserArray[0]]
                if (!browserName) return false
                const browserVersion = browserArray[1].match(/^\d+(\.\d+)?/)[0]
                return [browserName, browserVersion].join('')
            })
            .filter(v => v) as string[],
        sourcemap: (!isProduction && 'linked') as 'linked' | false,
        bundle: true,
        write: false,
        plugins: [
            stylePlugin({
                renderOptions: {
                    sassOptions: {
                        sourceMap: true,
                        sourceMapIncludeSources: true,
                    },
                },
                cssModulesOptions: {
                    generateScopedName: (name, filename) => generateClassName(name, filename),
                },
            }),
            assetLoader,
            useFs({fs: getVolume(), defaultImports: global.cherrySodaPackageJson.imports}),
            {
                name: 'result-handler',
                setup(build) {
                    build.onEnd(handleResult)
                }
            },
        ]
    }
}

let measuredEnd = false

function handleResult(result: BuildResult) {
    const hfs = getVolume()
    const virtualFilesDirName = virtualFilesPath.replace(/\//g, '')
    const matchFileComment = new RegExp(`^( *// ).+?(/${virtualFilesDirName}/.+)$`, 'gm')
    result.outputFiles?.forEach(({path, contents}) => {
        hfs.writeFileSync(path, path.endsWith('.js')
            ? new TextDecoder().decode(contents)
                .replace(matchFileComment, (match, insetComment, module) => {
                    return insetComment + moduleToFileNameMap.get(module)
                })
            : contents)
    })
    if (!measuredEnd) {
        resolveBundlerReadyPromise()
        addMarker('bundler', 'end')
        measuredEnd = true
    }
}
