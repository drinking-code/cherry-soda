import {default as iposPromise} from '../../ipos.js'
import {possibleExtensions} from '../helpers/resolve-file.js'

let ipos, moduleImports: Map<string, Array<string>>
;(async () => {
    ipos = await iposPromise
    if (!ipos.moduleImports)
        ipos.create('moduleImports', new Map())
    moduleImports = ipos.moduleImports
})()

export function addImports(key: string, imports: { [filename: string]: { [importedName: string]: string } }) {
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
        .filter(impFile => !possibleExtensions.find(extension => impFile.endsWith(extension)))
        .map(impFile => `import "${impFile}"`)
        .join("\n")
    moduleImports.clear()
    return importsString
}
