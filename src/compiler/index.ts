import {Volume} from 'memfs/lib/volume'

/*import Parser from './parser'
import {possibleExtensions} from './helpers/resolve-file'
import {resolve as resolveProjectRoot} from '../utils/project-root'
import generateClientScriptTrees from './client-script'
import {resolve as resolveModuleRoot} from '../utils/module-root'
import collectStyleFilePaths from './styles'
import bundleVirtualFiles from './bundler'*/
import extractTemplates from './template'

export default function compile(entry: string): { outputPath: string, fs: Volume } {
    /*const perf0 = performance.now()
    const parser = new Parser()
    const parseFileAndAllImportedFiles = filePath => {
        parser.parseFile(filePath)
        const imports = parser.getImports(filePath)
        const filePaths = Array.from(Object.keys(imports)
            .filter(filename => {
                return possibleExtensions.some(extension => filename.endsWith(extension)) &&
                    !filename.startsWith(resolveProjectRoot('node_module')) &&
                    !filename.startsWith(resolveModuleRoot('src')) // only needed during development on cc
            }))
        return filePaths.map(parseFileAndAllImportedFiles)
    }
    parseFileAndAllImportedFiles(entry)
    const perfA = performance.now()
    // console.log(`Parsing files took ${Math.round((perfA - perf0) * 1e1) / 1e1}ms`)
    const clientScriptTrees = generateClientScriptTrees(parser)
    const perfB = performance.now()
    // console.log(`Generating scoped client modules took ${Math.round((perfB - perfA) * 1e1) / 1e1}ms`)
    const styleFilePaths = collectStyleFilePaths(parser)
    const volumeAndPath = bundleVirtualFiles(clientScriptTrees, styleFilePaths)
    const perfC = performance.now()
    // console.log(`Bundling client scripts took ${Math.round((perfC - perfB) * 1e1) / 1e1}ms`)*/
    extractTemplates(entry)
    // return volumeAndPath
    return { outputPath: 'string', fs: null! }
}
