export default function getImports(ast) {
    return ast.program.body
        // filter imports
        // todo: get dynamic imports
        .filter(v => ['ImportDeclaration'].includes(v.type))
        .map(imp => {
            return {
                filename: imp.source.value,
                specifiers: imp.specifiers,
            }
        })
}
