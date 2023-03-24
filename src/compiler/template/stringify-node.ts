import {VirtualElementInterface} from '../../jsx/cherry-soda'
import TemplateBuilder from './template-builder'
import {jsx} from '../../jsx-runtime'
import {VirtualElement} from '../../jsx/VirtualElement'

export default function stringifyNode(element, clientTemplates, serverTemplates) {
    const component = jsx(() => element, {}) as VirtualElement
    const builder = new TemplateBuilder(clientTemplates, serverTemplates)
    return builder.makeTemplate(component as VirtualElementInterface<'component'>)
}
