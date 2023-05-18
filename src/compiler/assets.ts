// extract styles from components and compile them into a file

import path from 'path'
import fs from 'fs'

import {styleFilter} from './bundler/style-plugin'
import {imageFilter} from '../imports/images'
import {possibleExtensions} from './helpers/resolve-file'
import {resolve as resolveProjectRoot} from '../utils/project-root'
import {resolve as resolveModuleRoot} from '../utils/module-root'
import {addMarker} from './profiler'
import resolveImportFileSpecifier from './helpers/resolve-import-file-specifier'

let mappedStyleFiles: { [fileName: string]: string[] } = {}
const fileContents: { [fileName: string]: string } = {}
let changedFiles: string[]

export default function collectAssetsFilePaths(entry: string): Promise<string[]> {
    // todo: separate critical from non critical styles
    /* or into a level system:
    * 0: critical css      - must be immediately available
    * 1: visible css       - visible in any (reasonable) viewport after a page has fully loaded
    * 2: invisible css     - not immediately visible after full page load
    * 3: out-of-scope css  - not used on the current page / view (i.e. in another or not at all)
    *  */

    changedFiles = []
    const seenFiles: string[] = []
    addMarker('asset-collector', 'start')
    const transpiler = new Bun.Transpiler({loader: 'tsx'})
    addMarker('asset-collector', 'create-transpiler')
    const recursiveGetAllImports = entry => {
        seenFiles.push(entry)
        const newFileContents = fs.readFileSync(entry, 'utf8')
        if (newFileContents !== fileContents[entry])
            changedFiles.push(entry)
        fileContents[entry] = newFileContents
        const {imports} = transpiler.scan(fileContents[entry])
        // resolve file paths
        const resolvedImports = imports.map(({kind, path: filePath}) => {
            const resolvedPath = resolveImportFileSpecifier(path.dirname(entry), filePath)
            return {kind, path: resolvedPath}
        })
        mappedStyleFiles[entry] = []
        resolvedImports
            .forEach(({path: filePath}) => {
                if (filePath.match(styleFilter) || filePath.match(imageFilter)) {
                    mappedStyleFiles[entry].push(filePath)
                } else if (
                    filePath &&
                    possibleExtensions.some(extension => filePath.endsWith(extension)) &&
                    !filePath.startsWith(resolveProjectRoot('node_module')) &&
                    (process.env.INTERNAL_DEV !== 'true' || !filePath.startsWith(resolveModuleRoot('src'))) // only needed during development on cc
                ) {
                    recursiveGetAllImports(filePath)
                }
            })
    }
    recursiveGetAllImports(entry)

    for (const importerFile in mappedStyleFiles) {
        if (!seenFiles.includes(importerFile))
            delete mappedStyleFiles[importerFile]
    }

    addMarker('asset-collector', 'end')
    return Promise.resolve(getAssetsFilePaths())
}

export function getAssetsFilePaths(): string[] {
    return Array.from(Object.values(mappedStyleFiles)).flat()
}

export function getAllCurrentFiles(): string[] {
    return Array.from(Object.keys(fileContents)).flat()
}
