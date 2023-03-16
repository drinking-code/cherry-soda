import {ElementId, HashType} from '../jsx/VirtualElement'
import {
    arrayExpression, exportNamedDeclaration,
    identifier, numericLiteral,
    objectExpression,
    objectProperty, stringLiteral,
    variableDeclaration,
    variableDeclarator
} from '@babel/types'
import generate from '@babel/generator'
import {mapMapToArray, mapObjectToArray} from '../utils/iterate-object'
import {ClientTemplatesMapType} from './template/types'

const wrapQuoteIfStartsWithNumber = value => value.match(/^[0-9]/) ? `"${value}"` : value

export function refsToJs(refs: { [refId: string]: ElementId['fullPath'][] }): string {
    const ast = exportNamedDeclaration(variableDeclaration('const', [
        variableDeclarator(
            identifier('refs'),
            objectExpression(mapObjectToArray(refs, ([refId, refPaths]) =>
                objectProperty(
                    identifier(wrapQuoteIfStartsWithNumber(refId)),
                    arrayExpression(refPaths.map(refPath =>
                        arrayExpression(refPath.map(segment =>
                            typeof segment === 'number' ? numericLiteral(segment) : stringLiteral(segment)
                        ))
                    ))
                )
            ))
        )
    ]))
    return generate(ast).code
}

export function clientTemplatesToJs(templates: { clientTemplates: ClientTemplatesMapType, entry: HashType }): string {
    const ast = exportNamedDeclaration(variableDeclaration('const', [
        variableDeclarator(
            identifier('templates'),
            objectExpression(mapMapToArray(templates.clientTemplates, ([componentId, template]) =>
                objectProperty(
                    identifier(wrapQuoteIfStartsWithNumber(componentId)),
                    stringLiteral(template)
                )
            ))
        ),
        variableDeclarator(
            identifier('templatesEntry'),
            stringLiteral(templates.entry)
        )
    ]))
    return generate(ast, {jsescOption: {quotes: 'single'}}).code
}
