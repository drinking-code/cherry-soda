import path from 'path'

import createHybridFs from 'hybridfs'
import {Volume} from 'memfs/lib/volume'

import projectRoot, {resolve as resolveProjectRoot} from '../../utils/project-root'
import {resolve as resolveModuleRoot} from '../../utils/module-root'

const entryPoint = process.env.CHERRY_SODA_ENTRY
export const entryDir = path.dirname(entryPoint)
const mountFromSrc = ['runtime', 'messages', 'utils']
export const outputPath = '/dist'
export const virtualFilesPath = '/_virtual-files'

export const hfsEntryDir = entryDir.replace(projectRoot, '')

const hfs: Volume = createHybridFs([
    [resolveProjectRoot('node_modules'), '/node_modules'],
    [entryDir, hfsEntryDir],
    ...mountFromSrc.map(dir => [resolveModuleRoot('src', dir), '/' + dir]),
])

hfs.mkdirSync(outputPath)
hfs.mkdirSync(virtualFilesPath)

export function getVolume(): Volume {
    return hfs
}

const associatedFiles: Map<string, string> = new Map()
const cachedFileContents: Map<string, Buffer | string> = new Map()

export function cacheFileContent(fileName: string, contents: Buffer | string): void {
    cachedFileContents.set(fileName, contents)
}

export function associateFile(fileName: string, originalFileName: string): void {
    associatedFiles.set(fileName, originalFileName)
}

export function getOriginalFileContents(fileName: string): Buffer | string {
    return cachedFileContents.get(associatedFiles.get(fileName))
}

export function addFile(fileName: string, contents: Buffer | string, originalFileName?: string): void {
    if (originalFileName)
        associateFile(fileName, originalFileName)
}
