// extract styles from components and compile them into a file

import Parser from './parser'
import {iterateObject} from '../utils/iterate-object'
import {styleFilter} from './bundler/style-plugin'
import {imageFilter} from '../imports/images'

let styleFiles: string[] = []

export default function collectAssetsFilePaths(parser: Parser): string[] {
    // todo: separate critical from non critical styles
    /* or into a level system:
    * 0: critical css      - must be immediately available
    * 1: visible css       - visible in any (reasonable) viewport after a page has fully loaded
    * 2: invisible css     - not immediately visible after full page load
    * 3: out-of-scope css  - not used on the current page / view (i.e. in another or not at all)
    *  */

    parser.fileNames.forEach(fileName => {
        const fileImports = parser.getImports(fileName)
        iterateObject(fileImports, ([file]) => {
            if (!file.match(styleFilter) && !file.match(imageFilter)) return
            styleFiles.push(file)
        })
    })

    return styleFiles
}

export function getAssetsFilePaths(): string[] {
    return styleFiles
}
