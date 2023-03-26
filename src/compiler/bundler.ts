import path from 'path'

import esbuild, {BuildResult, Plugin} from 'esbuild'
import browserslist from 'browserslist'
import autoprefixer from 'autoprefixer'
import {Volume} from 'memfs/lib/volume'

import {resolve as resolveModuleRoot} from '../utils/module-root'
import {useFs} from './bundler/use-fs'
import imageLoader from '../imports/images'
import stylePlugin from './bundler/style-plugin'
import generateClassName from '../utils/generate-css-class-name'
import {addMarker} from './profiler'
import {AcceptedPlugin} from 'postcss'
import {
    generateClientScriptFile, generateRefsAndTemplatesFile,
    getVolume,
    inputFilePath,
    outputPath, refsAndTemplatesFilePath,
    virtualFilesPath
} from './client-script/generate-data-files'

export const isProduction = process.env.BUN_ENV === 'production'
let moduleToFileNameMap

export default async function bundleVirtualFiles(): Promise<Volume> {
    addMarker('bundler', 'start')
    const hfs = getVolume()
    moduleToFileNameMap = new Map()
    moduleToFileNameMap.set(refsAndTemplatesFilePath, 'refs and states')
    generateClientScriptFile(moduleToFileNameMap)
    generateRefsAndTemplatesFile()
    await startEsbuild()
    return hfs
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

async function startEsbuild() {
    const hfs = getVolume()
    // @ts-ignore TS2339: Property 'json' does not exist on type 'FileBlob'.
    const packageJson = await Bun.file(resolveModuleRoot('package.json')).json()
    let esCtx = await esbuild.context({
        entryPoints: [inputFilePath],
        inject: [path.join('/', 'runtime', 'index.ts'), refsAndTemplatesFilePath],
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
                postcss: {
                    plugins: [autoprefixer as AcceptedPlugin]
                },
                cssModulesOptions: {
                    scopeBehaviour: 'local',
                    generateScopedName: (name, filename) => generateClassName(name, filename),
                },
            }),
            imageLoader({fs: hfs, emit: true, path: outputPath}) as Plugin,
            useFs({fs: hfs, defaultImports: packageJson.imports}),
            {
                name: 'result-handler',
                setup(build) {
                    build.onEnd(handleResult)
                }
            },
        ]
    })

    let measuredEnd = false

    await esCtx.watch()

    function handleResult(result: BuildResult) {
        const virtualFilesDirName = virtualFilesPath.replace(/\//g, '')
        const matchFileComment = new RegExp(`^( *// ).+?(/${virtualFilesDirName}/.+)$`, 'gm')
        result.outputFiles?.forEach(({path, contents}) => {
            hfs.writeFileSync(path, new TextDecoder().decode(contents)
                .replace(matchFileComment, (match, insetComment, module) => {
                    return insetComment + moduleToFileNameMap.get(module)
                }))
        })
        if (!measuredEnd) {
            addMarker('bundler', 'end')
            measuredEnd = true
        }
    }
}
