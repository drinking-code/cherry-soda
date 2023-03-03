// extract styles from components and compile them into a file

import Parser from './parser'
import {iterateObject} from '../utils/iterate-object'

export default function collectStyleFilePaths(parser: Parser): string[] {
    // todo: separate critical from non critical styles
    /* or into a level system:
    * 0: critical css      - must be immediately available
    * 1: visible css       - visible in any (reasonable) viewport after a page has fully loaded
    * 2: invisible css     - not immediately visible after full page load
    * 3: out-of-scope css  - not used on the current page / view (i.e. in another or not at all)
    *  */

    const styleFiles = []

    parser.fileNames.forEach(fileName => {
        const fileImports = parser.getImports(fileName)
        iterateObject(fileImports, ([file]) => {
            if (!file.match(/\.s?[ac]ss$/)) return
                styleFiles.push(file)
        })
    })

    return styleFiles
}
