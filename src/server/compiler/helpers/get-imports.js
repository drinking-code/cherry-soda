export default function getImports(ast) {
    return ast.program.body
        // filter imports
        // todo: get dynamic imports
        .filter(v => ['ImportDeclaration'].includes(v.type))
        .map(imp => {
            return {
                source: imp.source.value,
                specifiers: Object.fromEntries(
                    imp.specifiers.map(specifier => [
                        (specifier.type === 'ImportDefaultSpecifier' ? 'Symbol(default-import)' : specifier.imported.name),
                        specifier.local.name
                    ])
                ),
            }
        })
}
