// render components to retrieve templates for them
// a template is the returned tree (where other components are references)
// a template may include a state somewhere (plain, or convoluted)

import '../imports/'
import {VirtualElement} from '../jsx/VirtualElement'
import {VirtualElementInterface, VirtualElementTypeType} from '../jsx/cherry-cola'
import {ElementChild} from '../jsx/ElementChildren'
import {filterObject, mapObject, mapObjectToArray} from '../utils/iterate-object'
import {ensureArray, isArray} from '../utils/array'
import {isObject} from '../utils/object'

interface HasToStringInterface {
    toString: () => string
}

type StringifiableType = StringifiableVariety | string | number | boolean | null | HasToStringInterface
type StringifiableVariety = { [p: string]: StringifiableType } | StringifiableType[]

type TemplatesMapType = Map<number, string>

export default async function extractTemplates(entry: string) {
    const templates: TemplatesMapType = new Map()
    const componentFunction = (await import(entry)).main

    const mockedComponent: VirtualElementInterface<'component'> = {
        type: 'component',
        function: componentFunction,
        props: {},
    }
    const entryHash = extractTemplateFromComponent(mockedComponent, templates)

    templates.forEach(value => console.log(value))
    return {templates, entry: entryHash}
}

function extractTemplateFromComponent(component: VirtualElementInterface<'component'>, templates: TemplatesMapType): number {
    const constructor = component.function
    const hash = Bun.hash(constructor.toString()) as number
    const returnValue = constructor(component.props)
    templates.set(hash, stringifyNodes(returnValue).join(''))
    return hash

    function stringifyNodes(nodes: ElementChild | ElementChild[]): string[] {
        const nodesArray = ensureArray(nodes)
        return nodesArray.map((node): string | false => {
            if (node instanceof VirtualElement) {
                const isComponent = (node: VirtualElementInterface):
                    node is VirtualElementInterface<'component'> => node.type === 'component'
                const isNotComponent = (node: VirtualElementInterface):
                    node is VirtualElementInterface<Exclude<VirtualElementTypeType, 'component'>> => node.type !== 'component'

                if (isComponent(node)) {
                    return stringifyComponent(node)
                } else if (isNotComponent(node)) {
                    return stringifyHtmlElement(node)
                } else return false
            } else if (!Array<any>(undefined, null, false).includes(node)) {
                // todo: state
                return stringifyTextNode(node)
            } else return false
        }).filter((v): v is string => !!v) // todo: concat string nodes
    }

    /* *** STRINGIFY TEMPLATE PART SPECIES *** */

    function stringifyComponent(component: VirtualElementInterface<'component'>): string {
        const hash = extractTemplateFromComponent(component, templates)
        const isState = value => true // todo
        const statesOnlyProps = filterObject(component.props as { [p: string]: any }, ([key, value]) => isState(value))
        const stringifiedProps = mapObjectToArray(statesOnlyProps, ([key, value]) =>
            `[${key}${stringifyStateNode(value)}]`
        )
        const wrappedProps = stringifiedProps.length === 1 ? stringifiedProps : `[${stringifiedProps}]`
        return `[${hash}${wrappedProps}]`
    }

    function stringifyHtmlElement(element: VirtualElementInterface<Exclude<VirtualElementTypeType, 'component'>>): string {
        const props = acceptableProps(element.props)
        const stringifiedProps = mapObjectToArray(props, ([key, value]) =>
            key + JSON.stringify(stringifyValue(value))
        )
        const stringifiedChildren = stringifyNodes(element.children)
        const wrappedChildren = stringifiedChildren.length === 1 ? stringifiedChildren : `[${stringifiedChildren.join('')}]`
        return `[${element.type}[${stringifiedProps.join('')}]${wrappedChildren}]`
    }

    function stringifyTextNode(value: StringifiableType): string {
        return `[0${JSON.stringify(stringifyValue(value))}]` // stringify again to escape »"«
    }

    function stringifyStateNode(data): string {
        return '#'
    }

    /* *** UTILS *** */

    function stringifyValue(value: StringifiableType) {
        if (isArray(value))
            return JSON.stringify(value.map(stringifyValue))
        else if (isObject(value))
            return JSON.stringify(mapObject(value, ([key, value]) => [key, stringifyValue(value)]))
        else
            return value.toString()
    }

    function acceptableProps(props: { [propName: string]: any }) { // todo
        return filterObject(props, ([propName]) => {
            return !['ref'].includes(propName)
        })
    }
}
