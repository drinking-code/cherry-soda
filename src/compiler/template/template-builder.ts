import {checkProps} from './check-props'
import {VirtualElementInterface, VirtualElementTypeType} from '../../jsx/cherry-cola'
import {
    ClientTemplatesMapType,
    ServerTemplateComponentType, ServerTemplateHTMLElementType,
    ServerTemplateNodeType,
    ServerTemplatesMapType, ServerTemplateStateType, ServerTemplateTextNodeType
} from './types'
import {ElementChild} from '../../jsx/ElementChildren'
import {ensureArray} from '../../utils/array'
import State, {isState, StateConcatenation} from '../../state/state'
import StateUsage, {isStateUsage} from '../../state/state-usage'
import {filterObject, mapObject, mapObjectToArray} from '../../utils/iterate-object'
import stringifyValue, {StringifiableType} from '../../utils/stringify'
import {randomNumber} from '../../utils/random'
import {setAutoComponent} from '../states-collector'

export default class TemplateBuilder {
    private readonly clientTemplates: ClientTemplatesMapType
    private readonly serverTemplates: ServerTemplatesMapType

    constructor(
        clientTemplates: ClientTemplatesMapType,
        serverTemplates: ServerTemplatesMapType,
    ) {
        this.clientTemplates = clientTemplates
        this.serverTemplates = serverTemplates
    }

    makeTemplate(component) {
        const constructor = component.function
        // seed to generate different hash when using `stringifyNode()`
        const seed = randomNumber(2)
        const hash = Bun.hash(constructor.toString(), constructor.name === 'function' && seed) as number
        setAutoComponent(hash)
        if (!this.clientTemplates.has(hash)) {
            const returnValue = constructor({
                children: component.children,
                ...component.props,
            })
            let [clientTemplatePart, serverTemplatePart] = this.stringifyNodes(returnValue)
            this.clientTemplates.set(hash, clientTemplatePart.join(''))
            this.serverTemplates.set(hash, serverTemplatePart)
        }
        return hash
    }

    private stringifyNodes(nodes: ElementChild | ElementChild[]): [string[], ServerTemplateNodeType[]] {
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
                    [clientTemplatePart, serverTemplatePart] = this.stringifyComponent(node)
                } else if (isNotComponent(node)) {
                    [clientTemplatePart, serverTemplatePart] = this.stringifyHtmlElement(node)
                } else clientTemplatePart = serverTemplatePart = false
            } else if (!Array<any>(undefined, null, false).includes(node)) {
                if (isState(node) || isStateUsage(node))
                    [clientTemplatePart, serverTemplatePart] = this.stringifyStateNode(node)
                else
                    [clientTemplatePart, serverTemplatePart] = this.stringifyTextNode(node)
            } else clientTemplatePart = serverTemplatePart = false

            clientTemplate.push(clientTemplatePart)
            serverTemplate.push(serverTemplatePart)
        })
        return [
            clientTemplate.filter((v): v is string => !!v), // todo: concat string nodes
            serverTemplate.filter((v): v is ServerTemplateNodeType => !!v),
        ]
    }

    private stringifyComponent(component: VirtualElementInterface<'component'>): [string, ServerTemplateComponentType] {
        const hash = this.makeTemplate(component)
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
            `[${key}${this.stringifyStateNode(value)}]`
        )
        const wrappedProps = stringifiedProps.length === 1 ? stringifiedProps : `[${stringifiedProps}]`
        return [
            `[${hash}${wrappedProps}]`,
            {type: 'component', key: hash, props: ensuredStateUsageProps}
        ]
    }

    private stringifyHtmlElement(element: VirtualElementInterface<Exclude<VirtualElementTypeType, 'component'>>): [string, ServerTemplateHTMLElementType] {
        const props = checkProps(element.props)
        const stringifiedProps = mapObjectToArray(props, ([key, value]) =>
            isState(value) || isStateUsage(value)
                ? '' // todo
                : key + JSON.stringify(stringifyValue(value))
        )
        const [stringifiedChildren, serverChildren] = this.stringifyNodes(element.children.flat())
        const wrappedChildren = stringifiedChildren.length === 1 ? stringifiedChildren : `[${stringifiedChildren.join('')}]`
        return [
            `[${element.type}[${stringifiedProps.join('')}]${wrappedChildren}]`,
            {type: 'dom-element', tagName: element.type, props, children: serverChildren}
        ]
    }

    private stringifyTextNode(value: StringifiableType): [string, ServerTemplateTextNodeType] {
        const string = stringifyValue(value)
        return [
            `[0${JSON.stringify(string)}]`, // stringify again to escape »"«
            {type: 'text', content: string}
        ]
    }

    private stringifyStateNode(state: State | StateConcatenation | StateUsage): [string, ServerTemplateStateType] {
        const stateUsage = isStateUsage(state) ? state : state.use()
        return [
            '#',
            {type: 'state', stateUsage}
        ]
    }
}
