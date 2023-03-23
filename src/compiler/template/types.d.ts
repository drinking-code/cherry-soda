import {AllHTMLAttributes} from '../../jsx/jsx-dom'
import StateUsage from '../../state/state-usage'
import {HashType} from '../../jsx/VirtualElement'

export type StateOnlyPropsType = { [p: string]: number/*todo: State*/ }
export type HTMLPropsType = MappedHTMLProps<AllHTMLAttributes<any>>
export type MappedHTMLProps<Props> = {
    [K in keyof Props]: Props[K] | StateUsage
}

export type ServerTemplateComponentType = { type: 'component', key: HashType, props: StateOnlyPropsType }
export type ServerTemplateHTMLElementType = {
    type: 'dom-element',
    tagName: string,
    props: HTMLPropsType,
    children: ServerTemplateNodeType | ServerTemplateNodeType[]
}
export type ServerTemplateTextNodeType = { type: 'text', content: string }
export type ServerTemplateStateType = { type: 'state', stateUsage: StateUsage }
export type ServerTemplateNodeType =
    ServerTemplateComponentType
    | ServerTemplateHTMLElementType
    | ServerTemplateTextNodeType
    | ServerTemplateStateType

export type ClientTemplatesMapType = Map<HashType, string>
// export type StateUsage = Map<HashType, string>
export type ServerTemplatesMapType = Map<HashType, ServerTemplateNodeType[]>
