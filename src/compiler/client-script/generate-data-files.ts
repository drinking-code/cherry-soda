import path from 'path'

import createHybridFs from 'hybridfs'
import {Volume} from 'memfs/lib/volume'

import projectRoot, {resolve as resolveProjectRoot} from '../../utils/project-root'
import {resolve as resolveModuleRoot} from '../../utils/module-root'
import {mapObjectToArray} from '../../utils/iterate-object'
import {randomBytes} from 'crypto'
import {replaceAsync} from '../../utils/replace-async'
import {addMarker, addRange} from '../profiler'
import {getRefs, getStateFromPlaceholderId, stateIdPlaceholderPrefix} from '../states-collector'
import {getAssetsFilePaths} from '../assets'
import {clientTemplatesToJs, refsToJs} from '../generate-code'
import { getStateUsagesAsCode } from '../template/state-usage'

const entryPoint = process.env.CHERRY_COLA_ENTRY
const entryDir = path.dirname(entryPoint)
const mountFromSrc = ['runtime', 'messages', 'utils']
export const outputPath = '/dist'
export const virtualFilesPath = '/_virtual-files'
export const inputFilePath = '/input.js'
export const refsAndTemplatesFilePath = path.join(virtualFilesPath, 'refs-and-templates.js')

const hfs: Volume = createHybridFs([
    [resolveProjectRoot('node_modules'), '/node_modules'],
    [entryDir, entryDir.replace(projectRoot, '')],
    ...mountFromSrc.map(dir => [resolveModuleRoot('src', dir), '/' + dir]),
])

hfs.mkdirSync(outputPath)
hfs.mkdirSync(virtualFilesPath)

export function getVolume(): Volume {
    return hfs
}

const newLine = "\n"

export async function generateClientScriptFile(moduleToFileNameMap: Map<string, string>) {
    /*const clientScriptsResolved = await Promise.allSettled(
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
                new RegExp(`['"]${stateIdPlaceholderPrefix}([a-zA-Z0-9]+)['"]`, 'g'),
                async (match, id) => {
                    addRange('bundler', `await-state-${id}`, 'start')
                    const string = `"${await getStateFromPlaceholderId(id)}"`
                    addRange('bundler', `await-state-${id}`, 'end')
                    return string
                })
            const fileContents = code + newLine +
                `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${new Buffer(sourceMap).toString('base64')}`
            hfs.writeFileSync(virtualFilePath, fileContents)
            return virtualFilePath
        })
    )*/
    /*const clientScripts = clientScriptsResolved.map(settled => {
        if (settled.status === 'fulfilled')
            return settled.value
        else return null
    }).filter(v => v)*/
    let inputFile = ''
    inputFile += getAssetsFilePaths().map(path => `import '${path}'`).join(newLine)
    inputFile += newLine
    // inputFile += clientScripts.map(virtualPath => `import '${virtualPath}'`).join(newLine)
    hfs.writeFileSync(inputFilePath, inputFile)
    addMarker('bundler', 'client-script-file')
}

export function generateRefsAndTemplatesFile(){
    const refsAndTemplatesFileContents = refsToJs(getRefs()) + newLine +
        clientTemplatesToJs() + newLine +
        getStateUsagesAsCode()
    hfs.writeFileSync(refsAndTemplatesFilePath, refsAndTemplatesFileContents)
    addMarker('bundler', 'ref-templates-file')
}
