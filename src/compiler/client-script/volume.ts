import path from 'path'

import createHybridFs from 'hybridfs'
import {Volume} from 'memfs/lib/volume'

import projectRoot, {resolve as resolveProjectRoot} from '../../utils/project-root'
import {resolve as resolveModuleRoot} from '../../utils/module-root'

const entryPoint = process.env.CHERRY_COLA_ENTRY
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
