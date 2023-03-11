import {VirtualElementInterface} from '../../jsx/cherry-cola'
import TemplateBuilder from './template-builder'

export default function stringifyNode(element, clientTemplates, serverTemplates) {
    const mockedComponent: VirtualElementInterface<'component'> = {
        type: 'component',
        function: () => element,
        props: {},
    }
    const builder = new TemplateBuilder(clientTemplates, serverTemplates)
    return builder.makeTemplate(mockedComponent)
}
