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
import {getStateUsagesAsCode} from '../template/state-usage'
import {getStateListenersAsCode} from '../../state/do-something'

const entryPoint = process.env.CHERRY_COLA_ENTRY
const entryDir = path.dirname(entryPoint)
const mountFromSrc = ['runtime', 'messages', 'utils']
export const outputPath = '/dist'
export const virtualFilesPath = '/_virtual-files'
export const stateListenersFilePath = path.join(virtualFilesPath, 'state-listeners.js')
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

export async function generateClientScriptFile() {
    let inputFile = ''
    inputFile += getAssetsFilePaths().map(path => `import '${path}'`).join(newLine)
    inputFile += newLine
    inputFile += getStateListenersAsCode()
    // inputFile += clientScripts.map(virtualPath => `import '${virtualPath}'`).join(newLine)
    hfs.writeFileSync(stateListenersFilePath, inputFile)
    addMarker('bundler', 'client-script-file')
}

export function generateRefsAndTemplatesFile() {
    const refsAndTemplatesFileContents =
        refsToJs(getRefs()) + newLine +
        clientTemplatesToJs() + newLine +
        getStateUsagesAsCode()
    hfs.writeFileSync(refsAndTemplatesFilePath, refsAndTemplatesFileContents)
    addMarker('bundler', 'ref-templates-file')
}
