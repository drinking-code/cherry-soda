import {ParseResult} from '@babel/parser'
import {ImportDeclaration, ImportDefaultSpecifier, ModuleSpecifier, Statement} from '@babel/types'
import {SpecifiersType} from './FileTree'

export default function getImports(ast: ParseResult<import("@babel/types").File>): Array<{ source: string, specifiers: SpecifiersType }> {
    return ast.program.body
        // filter imports
        // todo: get dynamic imports
        .filter(isImport)
        .map(imp => {
            return {
                source: imp.source.value,
                specifiers: Object.fromEntries(
                    imp.specifiers.map(specifier => [
                        (isDefaultImport(specifier)
                                ? 'Symbol(default-import)' :
                                ('imported' in specifier
                                        ? specifier.imported['name' in specifier.imported ? 'name' : 'value']
                                        : null
                                )
                        ),
                        specifier.local.name
                    ])
                ),
            }
        })
}

function isImport(statement: Statement): statement is ImportDeclaration {
    return statement.type === 'ImportDeclaration'
}

function isDefaultImport(specifier: ModuleSpecifier): specifier is ImportDefaultSpecifier {
    return specifier.type === 'ImportDefaultSpecifier'
}
