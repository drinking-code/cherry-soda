import path from 'path'

import esbuild, {BuildResult} from 'esbuild'
import browserslist from 'browserslist'
import generate from '@babel/generator'
import stylePlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import PrettyError from 'pretty-error'
import createHybridFs from 'hybridfs'
import {Volume} from 'memfs/lib/volume'

import {ClientModulesType} from './helpers/get-scoped-modules'
import {iterateObject, mapObject} from '../utils/iterate-object'
import projectRoot, {resolve as resolveProjectRoot} from '../utils/project-root'
import {resolve as resolveModuleRoot} from '../utils/module-root'
import {useFs} from './helpers/use-fs'
import {imageLoader} from '../imports/images'

export const isProduction = process.env.BUN_ENV === 'production'
export const outputPath = '/dist'
const inputFilePath = '/input.js'
const pe = new PrettyError()
let hfs: Volume

export default function bundleVirtualFiles(clientScriptTrees: ClientModulesType, styleFilePaths: string[]): { outputPath: string, fs: Volume } {
    const entryPoint = process.env.CHERRY_COLA_ENTRY
    const entryDir = path.dirname(entryPoint)
    hfs = createHybridFs([
        [resolveProjectRoot('node_modules'), '/node_modules'],
        [entryDir, entryDir.replace(projectRoot, '')],
        [resolveModuleRoot('src', 'runtime'), '/runtime'],
    ])
    hfs.mkdirSync(outputPath)

    const makePathRelative = path => path.replace(projectRoot, '').replace(/^\/?(.)/, './$1')
    const clientScripts = mapObject(clientScriptTrees, ([filePath, ast]) => {
        const relativePath = makePathRelative(filePath)
        return [relativePath, generate(ast).code]
    })
    let inputFile = ''
    const newLine = "\n"
    inputFile += styleFilePaths
        // .map(makePathRelative)
        .map(path => `import '${path}'`)
        .join(newLine)
    inputFile += newLine
    iterateObject(clientScripts, ([filePath, code]) => {
        inputFile += '// ' + filePath
        inputFile += newLine
        inputFile += code
        inputFile += newLine
    })
    hfs.writeFileSync(inputFilePath, inputFile)
    startEsbuild()
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
                postcss: {
                    plugins: [autoprefixer],
                }
            }),
            imageLoader({path: outputPath}),
            useFs({fs: hfs}),
            /*showCompilationStatus(typeof Bun !== 'undefined' ? label
                : (await import('chalk')).default.bgBlue(` ${label} `)
            ), {
                name: 'renderend-event',
                setup(build) {
                    build.onEnd(async () => {
                        endEventTarget.dispatchEvent(endEvent)
                    })
                }
            },*/
        ],
        watch: process.env.BUN_ENV === 'development' && {
            async onRebuild(error, result) {
                if (error)
                    return console.log(pe.render(error))
                handleResult(result)
            },
        },
    }).then(handleResult)

    function handleResult(result: BuildResult) {
        result.outputFiles?.forEach(({path, contents}) => {
            hfs.writeFileSync(path, contents)
        })
    }
}
