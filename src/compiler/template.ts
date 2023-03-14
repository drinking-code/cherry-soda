// render components to retrieve templates for them
// a template is the returned tree (where other components are references)
// a template may include a state somewhere (plain, or convoluted)

import '../imports/'
import {Props, VirtualElementInterface} from '../jsx/cherry-cola'
import {ElementChildren} from '../jsx/ElementChildren'
import bundleVirtualFiles from './bundler'
import State, {createState} from '../state/state'
import {ClientTemplatesMapType, ServerTemplateHTMLElementType, ServerTemplatesMapType} from './template/types'
import TemplateBuilder from './template/template-builder'

export default async function extractTemplates(entry: string, volumeAndPathPromise: Promise<ReturnType<typeof bundleVirtualFiles>>) {
    const clientTemplates: ClientTemplatesMapType = new Map()
    const serverTemplates: ServerTemplatesMapType = new Map()
    const componentFunction = (await import(entry)).main

    const mockedComponent: VirtualElementInterface<'component'> = {
        type: 'component',
        function: componentFunction,
        props: {},
    }
    const builder = new TemplateBuilder(clientTemplates, serverTemplates)
    let entryHash = builder.makeTemplate(mockedComponent)
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
        entryHash = builder.makeTemplate(mockedDocumentComponent)
    }

    return {clientTemplates, serverTemplates, entry: entryHash}
}
