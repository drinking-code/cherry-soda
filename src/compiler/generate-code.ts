import {ElementId} from '../jsx/VirtualElement'
import {mapMapToArray, mapObjectToArray} from '../utils/iterate-object'
import {getClientTemplates, getEntryHash} from './template'

const wrapQuoteIfStartsWithNumber = value => value.match(/^[0-9]/) ? `"${value}"` : value

export function refsToJs(refs: { [refId: string]: ElementId['fullPath'][] }): string {
    let code = ''
    code += 'export const refs = {'
    mapObjectToArray(refs, ([refId, refPaths]) => {
        code += wrapQuoteIfStartsWithNumber(refId)
        code += ': ['
        refPaths.forEach(refPath => {
            code += '['
            refPath.forEach(segment => {
                if (typeof segment === 'number')
                    code += segment
                else
                    code += `"${segment}"`
                code += ','
            })
            code += '],'
        })
        code += '],'
    })
    code += '}'
    return code
}

export function clientTemplatesToJs(): string {
    let code = ''
    code += 'export const templates = {'
    mapMapToArray(getClientTemplates(), ([componentId, template]) => {
        code += wrapQuoteIfStartsWithNumber(componentId)
        code += ':'
        code += `'${template}'`
        code += ','
    })
    code += '},'
    code += 'templatesEntry = '
    code += `"${getEntryHash()}"`
    return code
}
