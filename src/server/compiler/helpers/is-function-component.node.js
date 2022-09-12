import babelParser from '@babel/parser'

export default async function isFunctionComponent(javascript) {
    // criteria:
    // exports a function.
    // function returns type VirtualElement.
    const ast = babelParser.parse(javascript, {
        sourceType: 'module',
        plugins: [
            'jsx',
            'typescript',
        ],
    })
    // todo: test arrow functions, and return statements inside of nested code block (e.g. if statement)
    return ast.program.body
            // filter exports
            .filter(v => ['ExportDefaultDeclaration', 'ExportNamedDeclaration'].includes(v.type))
            // filter function exports
            .filter(v => v.declaration?.type === 'FunctionDeclaration')
            // get contents
            .map(v => v.declaration.body.body
                .filter(v => v.type === 'ReturnStatement')
                .map(v => v.argument)
                // function returns type VirtualElement
                .filter(v => v.type === 'JSXElement')
            )
            .flat()
            .length
        > 0
}
