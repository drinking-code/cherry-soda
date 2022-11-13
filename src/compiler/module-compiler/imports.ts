import {default as iposPromise} from '../../ipos'
import {SpecifiersType} from '../helpers/FileTree'

const ipos = await iposPromise
if (!ipos.moduleImports)
    ipos.create('moduleImports', new Map())
const moduleImports: Map<string, { [importedBy: string]: SpecifiersType }> = ipos.moduleImports

export function addImports(key: string, imports: { [filename: string]: SpecifiersType }, filter = true) {
    Array.from(Object.entries(imports))
        .filter(([impFile]) => !filter || !impFile.startsWith('#'))
        .filter(([impFile]) => !filter || allowedImportExtensions.find(extension => impFile.endsWith(extension)))
        .forEach(([impFile, specifiers]) => {
            let specifiersByImportingFile = {}
            if (moduleImports.has(impFile))
                specifiersByImportingFile = moduleImports.get(impFile)
            specifiersByImportingFile[key] = specifiers
            moduleImports.set(impFile, specifiersByImportingFile)
        })
}

export const allowedImportExtensions = ['.css', '.scss', '.sass']

export function getImportsAsString() {
    const importsString = Array.from(moduleImports.entries())
        .map(([impFile, specifiersByImportingFile]) => {
            const aggregatedSpecifiers = Object.values(specifiersByImportingFile)
                .map(specifiers => Object.entries(specifiers))
                .flat()
                .map(([imp, as]) => [imp === 'Symbol(default-import)' ? 'default' : imp, as])
                .map(([imp, as]) => imp === as ? imp : `${imp} as ${as}`)
            if (aggregatedSpecifiers?.length > 0)
                return `import {${aggregatedSpecifiers.join(', ')}} from "${impFile}"`
            else
                return `import "${impFile}"`
        })
        .join("\n")
    moduleImports.clear()
    return importsString
}
