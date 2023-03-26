// extract styles from components and compile them into a file

import path from 'path'

import {styleFilter} from './bundler/style-plugin'
import {imageFilter} from '../imports/images'
import {possibleExtensions} from './helpers/resolve-file'
import {resolve as resolveProjectRoot} from '../utils/project-root'
import {resolve as resolveModuleRoot} from '../utils/module-root'
import {addMarker} from './profiler'
import fs from 'fs'
import resolveImportFileSpecifier from './helpers/resolve-import-file-specifier'

let styleFiles: string[] = []

export default async function collectAssetsFilePaths(entry: string): Promise<string[]> {
    // todo: separate critical from non critical styles
    /* or into a level system:
    * 0: critical css      - must be immediately available
    * 1: visible css       - visible in any (reasonable) viewport after a page has fully loaded
    * 2: invisible css     - not immediately visible after full page load
    * 3: out-of-scope css  - not used on the current page / view (i.e. in another or not at all)
    *  */

    addMarker('asset-collector', 'start')
    const transpiler = new Bun.Transpiler({loader: 'tsx'})
    addMarker('asset-collector', 'create-transpiler')
    const recursiveGetAllImports = entry => {
        const {imports} = transpiler.scan(fs.readFileSync(entry, 'utf8'))
        // resolve file paths
        const resolvedImports = imports.map(({kind, path: filePath}) => {
            const resolvedPath = resolveImportFileSpecifier(path.dirname(entry), filePath)
            return {kind, path: resolvedPath}
        })
        // import all js (ts, jsx, tsx) files
        resolvedImports
            .filter(({kind, path: filePath}) =>
                possibleExtensions.some(extension => filePath.endsWith(extension)) &&
                !filePath.startsWith(resolveProjectRoot('node_module')) &&
                (process.env.INTERNAL_DEV === 'true' && !filePath.startsWith(resolveModuleRoot('src'))) // only needed during development on cc
            )
            .map(({kind, path: filePath}) => filePath)
            .map(recursiveGetAllImports)
        styleFiles.push(
            ...resolvedImports
                .filter(({kind, path: filePath}) =>
                    filePath.match(styleFilter) || filePath.match(imageFilter)
                )
                .map(({kind, path: filePath}) => filePath)
        )
    }
    recursiveGetAllImports(entry)
    addMarker('asset-collector', 'end')
    return Promise.resolve(styleFiles)
}

export function getAssetsFilePaths(): string[] {
    return styleFiles
}
