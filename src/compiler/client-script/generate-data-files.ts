import path from 'path'

import {iterateObject} from '../../utils/iterate-object'
import {addMarker} from '../profiler'
import {getRefs} from '../states-collector'
import {getAssetsFilePaths} from '../assets'
import {clientTemplatesToJs, refsToJs} from '../generate-code'
import {getStateUsagesAsCode} from '../template/state-usage'
import {getStateListenersAsCode} from '../../state/do-something'

const entryPoint = process.env.CHERRY_SODA_ENTRY
import {entryDir, hfsEntryDir} from './volume'
export {entryDir}
import {getVolume, virtualFilesPath} from './volume'
export {outputPath, getVolume, virtualFilesPath} from './volume'
export const stateListenersFileName = 'state-listeners.js'
export const stateListenersFilePath = path.join(virtualFilesPath, stateListenersFileName)
export const refsAndTemplatesFilePath = path.join(virtualFilesPath, 'refs-and-templates.js')

const newLine = "\n"

export async function generateClientScriptFile() {
    let inputFile = ''
    const hfs = getVolume()
    getAssetsFilePaths().forEach(path => {
        if (!path.startsWith('/'))
            path = '/' + path
        inputFile += `import '${path}'`
        inputFile += newLine
    })
    inputFile += newLine
    iterateObject(getStateListenersAsCode(), ([fileName, fileContents]) => {
        if (fileName === stateListenersFileName) {
            inputFile += fileContents
        } else {
            const filePath = path.join(virtualFilesPath, fileName)
            hfs.writeFileSync(filePath, fileContents)
        }
    })
    // inputFile += clientScripts.map(virtualPath => `import '${virtualPath}'`).join(newLine)
    hfs.writeFileSync(stateListenersFilePath, inputFile)
    addMarker('bundler', 'client-script-file')
}

export function generateRefsAndTemplatesFile() {
    const hfs = getVolume()
    const refsAndTemplatesFileContents =
        refsToJs(getRefs()) + newLine +
        clientTemplatesToJs() + newLine +
        getStateUsagesAsCode()
    hfs.writeFileSync(refsAndTemplatesFilePath, refsAndTemplatesFileContents)
    addMarker('bundler', 'ref-templates-file')
}
