// render components to retrieve templates for them
// a template is the returned tree (where other components are references)
// a template may include a state somewhere (plain, or convoluted)

import '../imports/'
import {Props, VirtualElementInterface, VirtualElementTypeType} from '../jsx/cherry-cola'
import {ElementChild, ElementChildren} from '../jsx/ElementChildren'
import {filterObject, mapObject, mapObjectToArray} from '../utils/iterate-object'
import {ensureArray} from '../utils/array'
import {AllHTMLAttributes} from '../jsx/jsx-dom'
import bundleVirtualFiles from './bundler'
import stringifyValue, {StringifiableType} from '../utils/stringify'
import State, {createState, isState, StateConcatenation} from '../state/state'
import StateUsage, {isStateUsage} from '../state/state-usage'

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
type ServerTemplateStateType = { type: 'state', stateUsage: StateUsage }
export type ServerTemplateNodeType =
    ServerTemplateComponentType
    | ServerTemplateHTMLElementType
    | ServerTemplateTextNodeType
    | ServerTemplateStateType

export type ClientTemplatesMapType = Map<number, string>
export type ServerTemplatesMapType = Map<number, ServerTemplateNodeType[]>

export default async function extractTemplates(entry: string, volumeAndPathPromise: Promise<ReturnType<typeof bundleVirtualFiles>>) {
    const clientTemplates: ClientTemplatesMapType = new Map()
    const serverTemplates: ServerTemplatesMapType = new Map()
    const componentFunction = (await import(entry)).main

    const mockedComponent: VirtualElementInterface<'component'> = {
        type: 'component',
        function: componentFunction,
        props: {},
    }
    let entryHash = extractTemplateFromComponent(mockedComponent, clientTemplates, serverTemplates)
    // check if first element is <html>
    let keyIndex = entryHash, firstElementHtml = false
    while (firstElementHtml === false) {
        const template = serverTemplates.get(keyIndex)
        const firstNode = template[0]
        if (!firstNode) break
        const isHTMLElement = ((el): el is ServerTemplateHTMLElementType =>
                el.type === 'dom-element'
        )(firstNode)
        if (isHTMLElement && firstNode.tagName === 'html') {
            firstElementHtml = true
        } else if (firstNode.type === 'component') {
            keyIndex = firstNode.key
            continue
        }
        break
    }
    if (!firstElementHtml) {
        const Document = (await import('../jsx/dom/default-document')).default
        const volumeAndPath = await volumeAndPathPromise
        const mockedDocumentComponent: VirtualElementInterface<'component', Props<'component'> & { clientAssets: State<typeof volumeAndPath> }> = {
            type: 'component',
            function: Document,
            props: {clientAssets: createState(volumeAndPath)},
            children: new ElementChildren(mockedComponent)
        }
        entryHash = extractTemplateFromComponent(mockedDocumentComponent, clientTemplates, serverTemplates)
    }

    // clientTemplates.forEach(value => console.log(value))
    // serverTemplates.forEach(value => console.log(value))
    return {clientTemplates, serverTemplates, entry: entryHash}
}

export function extractTemplateFromComponent(
    component: VirtualElementInterface<'component'>,
    clientTemplates: ClientTemplatesMapType,
    serverTemplates: ServerTemplatesMapType,
): number {
    const constructor = component.function
    const hash = Bun.hash(constructor.toString()) as number
    if (!clientTemplates.has(hash)) {
        const returnValue = constructor({
            children: component.children,
            ...component.props,
        })
        let [clientTemplatePart, serverTemplatePart] = stringifyNodes(returnValue, clientTemplates, serverTemplates)
        clientTemplates.set(hash, clientTemplatePart.join(''))
        serverTemplates.set(hash, serverTemplatePart)
    }
    return hash
}

export function stringifyNodes(
    nodes: ElementChild | ElementChild[],
    clientTemplates: ClientTemplatesMapType,
    serverTemplates: ServerTemplatesMapType
): [string[], ServerTemplateNodeType[]] {
    const nodesArray = ensureArray(nodes)
    const clientTemplate: (string | false)[] = []
    const serverTemplate: (ServerTemplateNodeType | false)[] = []
    nodesArray.forEach((node) => {
        let clientTemplatePart: string | false, serverTemplatePart: ServerTemplateNodeType | false
        const isVirtualElementInterface = ((node): node is VirtualElementInterface =>
                typeof node === 'object' && 'type' in node && 'props' in node
        )(node)
        if (isVirtualElementInterface) {
            const isComponent = (node: VirtualElementInterface):
                node is VirtualElementInterface<'component'> => node.type === 'component'
            const isNotComponent = (node: VirtualElementInterface):
                node is VirtualElementInterface<Exclude<VirtualElementTypeType, 'component'>> => node.type !== 'component'

            if (isComponent(node)) {
                [clientTemplatePart, serverTemplatePart] = stringifyComponent(node, clientTemplates, serverTemplates)
            } else if (isNotComponent(node)) {
                [clientTemplatePart, serverTemplatePart] = stringifyHtmlElement(node, clientTemplates, serverTemplates)
            } else clientTemplatePart = serverTemplatePart = false
        } else if (!Array<any>(undefined, null, false).includes(node)) {
            if (isState(node) || isStateUsage(node))
                [clientTemplatePart, serverTemplatePart] = stringifyStateNode(node)
            else
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

function stringifyComponent(
    component: VirtualElementInterface<'component'>,
    clientTemplates: ClientTemplatesMapType,
    serverTemplates: ServerTemplatesMapType
): [string, ServerTemplateComponentType] {
    const hash = extractTemplateFromComponent(component, clientTemplates, serverTemplates)
    const statesOnlyProps = filterObject(
        component.props as { [p: string]: any },
        (entry): entry is [string, State | StateConcatenation | StateUsage] =>
            isState(entry[1]) || isStateUsage(entry[1])
    )
    const ensuredStateUsageProps = mapObject(
        statesOnlyProps,
        ([key, value]) => [key, isStateUsage(value) ? value : value.use()]
    )
    const stringifiedProps = mapObjectToArray(ensuredStateUsageProps, ([key, value]) =>
        `[${key}${stringifyStateNode(value)}]`
    )
    const wrappedProps = stringifiedProps.length === 1 ? stringifiedProps : `[${stringifiedProps}]`
    return [
        `[${hash}${wrappedProps}]`,
        {type: 'component', key: hash, props: ensuredStateUsageProps}
    ]
}

function stringifyHtmlElement(
    element: VirtualElementInterface<Exclude<VirtualElementTypeType, 'component'>>,
    clientTemplates: ClientTemplatesMapType,
    serverTemplates: ServerTemplatesMapType
): [string, ServerTemplateHTMLElementType] {
    const props = acceptableProps(element.props)
    const stringifiedProps = mapObjectToArray(props, ([key, value]) =>
        isState(value) || isStateUsage(value)
            ? '' // todo
            : key + JSON.stringify(stringifyValue(value))
    )
    const [stringifiedChildren, serverChildren] = stringifyNodes(element.children.flat(), clientTemplates, serverTemplates)
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

function stringifyStateNode(state: State | StateConcatenation | StateUsage): [string, ServerTemplateStateType] {
    const stateUsage = isStateUsage(state) ? state : state.use()
    return [
        '#',
        {type: 'state', stateUsage}
    ]
}

/* *** UTILS *** */

function acceptableProps(props: { [propName: string]: any }) { // todo
    const mapped = mapObject(props, ([propName, propValue]) => {
        if (propName === 'className')
            propName = 'class'
        return [propName.toLowerCase(), propValue]
    })
    return filterObject(mapped, ([propName]) => {
        return !['ref'].includes(propName)
    })
}
