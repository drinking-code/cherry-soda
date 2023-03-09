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
import {AllHTMLAttributes} from '../jsx/jsx-dom'
import {validTags, voidElements} from '../jsx/dom/html-props'

interface HasToStringInterface {
    toString: () => string
}

type StringifiableType = StringifiableVariety | string | number | boolean | null | HasToStringInterface
type StringifiableVariety = { [p: string]: StringifiableType } | StringifiableType[]

type StateOnlyPropsType = { [p: string]: number/*todo: State*/ }
type HTMLPropsType = MappedHTMLProps<AllHTMLAttributes<any>>
type MappedHTMLProps<Props> = {
    [K in keyof Props]: Props[K] /*| todo: StateUsage*/
}

type ServerTemplateComponentType = { type: 'component', key: number, props: StateOnlyPropsType }
type ServerTemplateHTMLElementType = {
    type: 'dom-element',
    tagName: string,
    props: HTMLPropsType,
    children: ServerTemplateNodeType | ServerTemplateNodeType[]
}
type ServerTemplateTextNodeType = { type: 'text', content: string }
export type ServerTemplateNodeType = ServerTemplateComponentType | ServerTemplateHTMLElementType | ServerTemplateTextNodeType

type ClientTemplatesMapType = Map<number, string>
export type ServerTemplatesMapType = Map<number, ServerTemplateNodeType[]>

export default async function extractTemplates(entry: string) {
    const clientTemplates: ClientTemplatesMapType = new Map()
    const serverTemplates: ServerTemplatesMapType = new Map()
    const componentFunction = (await import(entry)).main

    const mockedComponent: VirtualElementInterface<'component'> = {
        type: 'component',
        function: componentFunction,
        props: {},
    }
    const entryHash = extractTemplateFromComponent(mockedComponent, clientTemplates, serverTemplates)

    // clientTemplates.forEach(value => console.log(value))
    // serverTemplates.forEach(value => console.log(value))
    return {clientTemplates, serverTemplates, entry: entryHash}
}

function extractTemplateFromComponent(component: VirtualElementInterface<'component'>, clientTemplates: ClientTemplatesMapType, serverTemplates: ServerTemplatesMapType): number {
    const constructor = component.function
    const hash = Bun.hash(constructor.toString()) as number
    const returnValue = constructor(component.props)
    let [clientTemplatePart, serverTemplatePart] = stringifyNodes(returnValue)
    clientTemplates.set(hash, clientTemplatePart.join(''))
    serverTemplates.set(hash, serverTemplatePart)
    return hash

    function stringifyNodes(nodes: ElementChild | ElementChild[]): [string[], ServerTemplateNodeType[]] {
        const nodesArray = ensureArray(nodes)
        const clientTemplate: (string | false)[] = []
        const serverTemplate: (ServerTemplateNodeType | false)[] = []
        nodesArray.forEach((node) => {
            let clientTemplatePart: string | false, serverTemplatePart: ServerTemplateNodeType | false
            if (node instanceof VirtualElement) {
                const isComponent = (node: VirtualElementInterface):
                    node is VirtualElementInterface<'component'> => node.type === 'component'
                const isNotComponent = (node: VirtualElementInterface):
                    node is VirtualElementInterface<Exclude<VirtualElementTypeType, 'component'>> => node.type !== 'component'

                if (isComponent(node)) {
                    [clientTemplatePart, serverTemplatePart] = stringifyComponent(node)
                } else if (isNotComponent(node)) {
                    [clientTemplatePart, serverTemplatePart] = stringifyHtmlElement(node)
                } else clientTemplatePart = serverTemplatePart = false
            } else if (!Array<any>(undefined, null, false).includes(node)) {
                // todo: state
                [clientTemplatePart, serverTemplatePart] = stringifyTextNode(node)
            } else clientTemplatePart = serverTemplatePart = false

            clientTemplate.push(clientTemplatePart)
            serverTemplate.push(serverTemplatePart)
        })
        return [
            clientTemplate.filter((v): v is string => !!v), // todo: concat string nodes
            serverTemplate.filter((v): v is ServerTemplateNodeType => !!v),
        ]
    }

    /* *** STRINGIFY TEMPLATE PART SPECIES *** */

    function stringifyComponent(component: VirtualElementInterface<'component'>): [string, ServerTemplateComponentType] {
        const hash = extractTemplateFromComponent(component, clientTemplates, serverTemplates)
        const isState = value => true // todo
        const statesOnlyProps = filterObject(component.props as { [p: string]: any }, ([key, value]) => isState(value))
        const stringifiedProps = mapObjectToArray(statesOnlyProps, ([key, value]) =>
            `[${key}${stringifyStateNode(value)}]`
        )
        const wrappedProps = stringifiedProps.length === 1 ? stringifiedProps : `[${stringifiedProps}]`
        return [
            `[${hash}${wrappedProps}]`,
            {type: 'component', key: hash, props: statesOnlyProps}
        ]
    }

    function stringifyHtmlElement(element: VirtualElementInterface<Exclude<VirtualElementTypeType, 'component'>>): [string, ServerTemplateHTMLElementType] {
        const props = acceptableProps(element.props)
        const stringifiedProps = mapObjectToArray(props, ([key, value]) =>
            key + JSON.stringify(stringifyValue(value))
        )
        const [stringifiedChildren, serverChildren] = stringifyNodes(element.children)
        const wrappedChildren = stringifiedChildren.length === 1 ? stringifiedChildren : `[${stringifiedChildren.join('')}]`
        return [
            `[${element.type}[${stringifiedProps.join('')}]${wrappedChildren}]`,
            {type: 'dom-element', tagName: element.type, props, children: serverChildren}
        ]
    }

    function stringifyTextNode(value: StringifiableType): [string, ServerTemplateTextNodeType] {
        const string = stringifyValue(value)
        return [
            `[0${JSON.stringify(string)}]`, // stringify again to escape »"«
            {type: 'text', content: string}
        ]
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
        const mapped = mapObject(props, ([propName, propValue]) => {
            if (propName === 'className')
                propName = 'class'
            return [propName, propValue]
        })
        return filterObject(mapped, ([propName]) => {
            return !['ref'].includes(propName)
        })
    }
}
