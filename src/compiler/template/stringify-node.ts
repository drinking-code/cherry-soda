import {VirtualElementInterface} from '../../jsx/cherry-soda'
import TemplateBuilder from './template-builder'
import {jsx} from '../../jsx-runtime'
import {VirtualElement} from '../../jsx/VirtualElement'
import {getClientTemplates, getServerTemplates} from '../template'

export default function stringifyNode(element) {
    const component = jsx(() => element, {}) as VirtualElement
    const builder = new TemplateBuilder(getClientTemplates(), getServerTemplates())
    return builder.makeTemplate(component as VirtualElementInterface<'component'>)
}
