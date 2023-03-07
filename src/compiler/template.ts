// render components to retrieve templates for them
// a template is the returned tree (where other components are references)
// a template may include a state somewhere (plain, or convoluted)

import '../imports/'
import {VirtualElement} from '../jsx/VirtualElement'
import {VirtualElementInterface} from '../jsx/cherry-cola'
import {ElementChild} from '../jsx/ElementChildren'
import {entriesArray, filterObject, mapObject, mapObjectToArray} from '../utils/iterate-object'
import {AllHTMLAttributes} from '../jsx/jsx-dom'
import {ensureArray} from '../utils/array'

export type PropsType = [string, string][]
export type TemplateComponentType = [number, { [key: string]: /*todo: State*/any }]
export type TemplateHTMLType = [string, PropsType, TemplateElementType | TemplateElementType[]]
export type TemplateTextType = [0, string]
export type TemplateElementType = TemplateHTMLType | TemplateTextType | TemplateComponentType
export type TemplateType = TemplateElementType[]

export default async function extractTemplates(entry: string) {
    const templates: Map<number, TemplateType> = new Map()
    const componentFunction = (await import(entry)).main

    function extractTemplateFromComponent(component: VirtualElementInterface<'component'>): number {
        const constructor = component.function
        const hash = Bun.hash(constructor.toString()) as number
        const returnValue = constructor(component.props)
        templates.set(hash, makeTemplate(returnValue as VirtualElement))
        return hash
    }

    function makeTemplate(elements: ElementChild | ElementChild[]): TemplateType {
        const elementsArray = ensureArray(elements)

        function getTemplateElement(element: ElementChild): TemplateElementType | false {
            let elementTemplate: TemplateElementType | false
            if (element instanceof VirtualElement) {
                const props = acceptableProps(element.props)
                if (element.type === 'component') {
                    const hash = extractTemplateFromComponent(element as VirtualElementInterface<'component'>)
                    elementTemplate = [hash, props]
                } else {
                    const children = makeTemplate(element.children)
                    elementTemplate = [
                        element.type,
                        entriesArray(props),
                        children
                    ]
                }
            } else if ([undefined, null].includes(element)) {
                elementTemplate = false
            } else {
                elementTemplate = [0, element.toString()]
            }
            return elementTemplate
        }

        return elementsArray.map(getTemplateElement).filter(v => v) as TemplateElementType[]
    }

    const mockedComponent: VirtualElementInterface<'component'> = {
        type: 'component',
        function: componentFunction,
        props: {},
    }
    const entryHash = extractTemplateFromComponent(mockedComponent)
    const stringifyIdValueArray = (array: [number, string][]) => array.map(([n, s]) => `${n}"${s}"`).join('')

    function stringifyTemplateElement(element) {
        if (Array.isArray(element[1])) { // TemplateHTMLType
            const [type, aliasedProps, children] = element
            const stringifiedChildrenArray = children.map(stringifyTemplateElement)
            const stringifiedChildren = stringifiedChildrenArray.length === 1
                ? stringifiedChildrenArray[0]
                : `[${stringifiedChildrenArray.join('')}]`
            return `[${type}[${stringifyIdValueArray(aliasedProps)}]${stringifiedChildren}]`
        } else if (typeof element[1] === 'string') { // TemplateTextType
            const [zero, text] = element
            return `[0"${text}"]`
        }
        return element
    }

    templates.forEach((elements, key) => {
        console.log(JSON.stringify(elements))
        console.log(elements.map(stringifyTemplateElement).join(''))
    })
    console.log(htmlFromTemplate(templates, entryHash))
}

function acceptableProps(props: { [propName: string]: any }) {
    return filterObject(props, ([propName]) => {
        return !['ref'].includes(propName)
    })
}

function htmlFromTemplate(templates: Map<number, TemplateType>, entry: number): string {
    function elementToHtml(elements: TemplateType): string {
        return elements.map(element => {
            const isText = ((el): el is TemplateTextType => el[0] === 0)(element)
            const isComponent = ((el): el is TemplateComponentType =>
                    !isText && typeof el[0] === 'number'
            )(element)
            const isHtmlElement = ((el): el is TemplateHTMLType => typeof el[0] === 'string')(element)
            if (isText) {
                return element[1]
            } else if (isHtmlElement) {
                const [tag, props, childrenOrChild] = element
                const stringifiedProps = props.map(([key, value]) => `${key}="${value}"`).join(' ')
                const stringifiedPropsWithSpace = stringifiedProps.length > 0 ? ' ' + stringifiedProps : ''
                const children = (<E = TemplateElementType>(value: E | E[]): E[] => {
                    const isTemplateElement = (value: E | E[]): value is E => !Array.isArray(value[0])
                    return isTemplateElement(value) ? [value] : value
                })(childrenOrChild)
                const stringifiedChildren = children.length > 0 && elementToHtml(children)
                return `<${tag}${stringifiedPropsWithSpace}>${stringifiedChildren}</${tag}>`
            } else if (isComponent) {
                return elementToHtml(templates.get(element[0]))
            }
        }).join('')
    }

    return elementToHtml(templates.get(entry))
}
