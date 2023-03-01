import Parser from './parser'
import {possibleExtensions} from './helpers/resolve-file'
import projectRoot from '../utils/project-root'
import extractDoSomethings from './client-script'
import moduleRoot from '../utils/module-root'

export default async function compile(entry: string) {
    const parser = new Parser()
    const parseFileAndAllImportedFiles = filePath => parser.parseFile(filePath)
        .then(() => parser.getImports(filePath))
        .then(imports => Array.from(Object.keys(imports))
            .filter(filename => {
                return possibleExtensions.some(extension => filename.endsWith(extension)) &&
                    !filename.startsWith(projectRoot.resolve('node_module')) &&
                    !filename.startsWith(moduleRoot.resolve('src')) // only needed during development on cc
            })
        )
        .then(filePaths => Promise.allSettled(filePaths.map(parseFileAndAllImportedFiles)))
    await parseFileAndAllImportedFiles(entry)
    // parser.printFileTree(parser.fileNames[1])
    extractDoSomethings(parser)
}
