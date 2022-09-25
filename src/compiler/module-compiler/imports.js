import {default as iposPromise} from '../../ipos.js'
import {possibleExtensions} from '../helpers/resolve-file.js'

let ipos
;(async () => {
    ipos = await iposPromise
    if (!ipos.moduleImports)
        ipos.create('moduleImports', new Map())
})()

export function addImports(key, imports) {
    Array.from(Object.keys(imports)).forEach(impFile => {
        let importedBy = []
        if (ipos.moduleImports.has(impFile))
            importedBy = ipos.moduleImports.get(impFile)
        importedBy.push(key)
        ipos.moduleImports.set(impFile, importedBy)
    })
}

export function getImportsAsString() {
    const importsString = Array.from(ipos.moduleImports.keys())
        .filter(impFile => !possibleExtensions.find(extension => impFile.endsWith(extension)))
        .map(impFile => `import "${impFile}"`)
        .join("\n")
    ipos.moduleImports.clear()
    return importsString
}
