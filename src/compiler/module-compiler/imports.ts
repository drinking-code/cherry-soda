import {default as iposPromise} from '../../ipos'
import {possibleExtensions} from '../helpers/resolve-file.js'
import {SpecifiersType} from '../helpers/FileTree'

const ipos = await iposPromise
if (!ipos.moduleImports)
    ipos.create('moduleImports', new Map())
const moduleImports: Map<string, Array<string>> = ipos.moduleImports

export function addImports(key: string, imports: { [filename: string]: SpecifiersType }) {
    Array.from(Object.keys(imports)).forEach(impFile => {
        let importedBy = []
        if (moduleImports.has(impFile))
            importedBy = moduleImports.get(impFile)
        importedBy.push(key)
        moduleImports.set(impFile, importedBy)
    })
}

export function getImportsAsString() {
    const importsString = Array.from(moduleImports.keys())
        .filter(impFile => !impFile.startsWith('#'))
        .filter(impFile => !possibleExtensions.find(extension => impFile.endsWith(extension)))
        .map(impFile => `import "${impFile}"`)
        .join("\n")
    moduleImports.clear()
    return importsString
}
