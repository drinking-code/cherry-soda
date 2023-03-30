import {HashType} from '../../jsx/VirtualElement'
import {getLexicalScope, ImportDataType} from './extract-function'
import generate from '@babel/generator'
import {program, Statement} from '@babel/types'
import {Scope} from './scope'

export function getStringifiedLexicalScope(id: HashType, index: number, transformImportPath: (path: string) => string) {
    const lexicalScope = getLexicalScope(id, index)
    const lexicalScopeStatements = lexicalScope.filter((element): element is Statement => 'kind' in element)
    const lexicalScopeImports = lexicalScope.filter((element): element is ImportDataType => !('kind' in element))
    const imports = lexicalScopeImports
        .map(importData => {
            let importNames
            if (importData.importName === importData.localName) {
                importNames = `{${importData.importName}}`
            } else if (importData.importName === Scope.defaultImport) {
                importNames = importData.localName
            } else if (importData.importName === Scope.importAll) {
                importNames = `* as ${importData.localName}`
            } else {
                importNames = `{${importData.importName as string} as ${importData.localName}}`
            }
            return `import ${importNames} from '${transformImportPath(importData.filePath)}'`
        })
        .join("\n")
    const statements = generate(program(lexicalScopeStatements)).code
    return imports + "\n" + statements
}
