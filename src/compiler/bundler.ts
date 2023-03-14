import path from 'path'
import {randomBytes} from 'crypto'

import esbuild, {BuildResult} from 'esbuild'
import browserslist from 'browserslist'
import autoprefixer from 'autoprefixer'
import PrettyError from 'pretty-error'
import createHybridFs from 'hybridfs'
import {Volume} from 'memfs/lib/volume'

import {ClientModulesType} from './client-script/get-scoped-modules'
import {mapObjectToArray} from '../utils/iterate-object'
import projectRoot, {resolve as resolveProjectRoot} from '../utils/project-root'
import {resolve as resolveModuleRoot} from '../utils/module-root'
import {useFs} from './bundler/use-fs'
import {imageLoader} from '../imports/images'
import stylePlugin from './bundler/style-plugin'
import generateClassName from '../utils/generate-css-class-name'
import {getStateFromPlaceholderId, stateIdPlaceholderPrefix} from './states-collector'
import {replaceAsync} from '../utils/replace-async'

export const isProduction = process.env.BUN_ENV === 'production'
export const outputPath = '/dist'
export const virtualFilesPath = '/_virtual-files'
const inputFilePath = '/input.js'
const pe = new PrettyError()
let hfs: Volume
let moduleToFileNameMap

export default function bundleVirtualFiles(clientScriptTrees: ClientModulesType, styleFilePaths: string[]): { outputPath: string, fs: Volume } {
    const entryPoint = process.env.CHERRY_COLA_ENTRY
    const entryDir = path.dirname(entryPoint)
    const mountFromSrc = ['runtime', 'messages', 'utils']
    hfs = createHybridFs([
        [resolveProjectRoot('node_modules'), '/node_modules'],
        [entryDir, entryDir.replace(projectRoot, '')],
        ...mountFromSrc.map(dir => [resolveModuleRoot('src', dir), '/' + dir]),
    ])
    hfs.mkdirSync(outputPath)
    hfs.mkdirSync(virtualFilesPath)
    ;(async () => {
        const newLine = "\n"
        moduleToFileNameMap = new Map()
        const clientScriptsResolved = await Promise.allSettled(
            mapObjectToArray(clientScriptTrees, async ([filePath, fileResult]) => {
                const virtualFileName = randomBytes(16).toString('base64url') + '.js'
                const virtualFilePath = path.join(virtualFilesPath, virtualFileName)
                // transform sources to show up correctly and relative to project root after esbuild
                fileResult.map.sources = fileResult.map.sources.map(filePath => filePath.replace(projectRoot, '..'))
                const sourceMap = JSON.stringify(fileResult.map)
                moduleToFileNameMap.set(
                    virtualFilePath,
                    // @ts-ignore
                    fileResult.options.sourceFileName.replace(projectRoot, '.')
                )
                const code = await replaceAsync(
                    fileResult.code,
                    new RegExp(`[\'"]${stateIdPlaceholderPrefix}([a-zA-Z0-9]+)[\'"]`, 'g'),
                    async (match, id) => `"${await getStateFromPlaceholderId(id)}"`)
                const fileContents = code + newLine +
                    `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${new Buffer(sourceMap).toString('base64')}`
                hfs.writeFileSync(virtualFilePath, fileContents)
                return virtualFilePath
            })
        )
        const clientScripts = clientScriptsResolved.map(settled => {
            if (settled.status === 'fulfilled')
                return settled.value
            else return null
        }).filter(v => v)
        let inputFile = ''
        inputFile += styleFilePaths.map(path => `import '${path}'`).join(newLine)
        inputFile += newLine
        inputFile += clientScripts.map(virtualPath => `import '${virtualPath}'`).join(newLine)
        hfs.writeFileSync(inputFilePath, inputFile)
        await startEsbuild()
    })()
    return {outputPath, fs: hfs}
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
    // @ts-ignore TS2339: Property 'json' does not exist on type 'FileBlob'.
    const packageJson = await Bun.file(resolveModuleRoot('package.json')).json()
    await esbuild.build({
        entryPoints: [inputFilePath],
        inject: [path.join('/', 'runtime', 'index.ts')],
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
                    plugins: [autoprefixer]
                },
                cssModulesOptions: {
                    scopeBehaviour: 'local',
                    generateScopedName: (name, filename) =>
                        generateClassName(name, filename),
                },
            }),
            imageLoader({path: outputPath}),
            useFs({fs: hfs, defaultImports: packageJson.imports}),
        ],
        watch: process.env.BUN_ENV === 'development' && {
            async onRebuild(error, result) {
                if (error) return console.log(pe.render(error))
                handleResult(result)
            },
        },
    }).then(handleResult)

    function handleResult(result: BuildResult) {
        const virtualFilesDirName = virtualFilesPath.replace(/\//g, '')
        const matchFileComment = new RegExp(`^( *// ).+?(/${virtualFilesDirName}/.+)$`, 'gm')
        result.outputFiles?.forEach(({path, contents}) => {
            hfs.writeFileSync(path, new TextDecoder().decode(contents)
                .replace(matchFileComment, (match, insetComment, module) => {
                    return insetComment + moduleToFileNameMap.get(module)
                }))
        })
    }
}
