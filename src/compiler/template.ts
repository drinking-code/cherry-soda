// render components to retrieve templates for them
// a template is the returned tree (where other components are references)
// a template may include a state somewhere (plain, or convoluted)

import '../imports/'
import {VirtualElementInterface} from '../jsx/cherry-cola'
import {ElementChildren} from '../jsx/ElementChildren'
import bundleVirtualFiles from './bundler'
import {createState} from '#cherry-cola'
import {ClientTemplatesMapType, ServerTemplateHTMLElementType, ServerTemplatesMapType} from './template/types'
import TemplateBuilder from './template/template-builder'
import {jsx} from '../jsx-runtime'
import {VirtualElement} from '../jsx/VirtualElement'

export default async function extractTemplates(entry: string, volumeAndPathPromise: Promise<ReturnType<typeof bundleVirtualFiles>>) {
    const clientTemplates: ClientTemplatesMapType = new Map()
    const serverTemplates: ServerTemplatesMapType = new Map()
    const componentFunction = (await import(entry)).main

    const mainComponent = jsx(componentFunction, {}) as VirtualElement

    const builder = new TemplateBuilder(clientTemplates, serverTemplates)
    let entryHash = builder.makeTemplate(mainComponent as VirtualElementInterface<'component'>)
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
        const documentComponent = jsx(Document, {
            clientAssets: createState(volumeAndPath),
            children: new ElementChildren(mainComponent)
        }) as VirtualElement

        entryHash = builder.makeTemplate(documentComponent as VirtualElementInterface<'component'>)

        // retrace body dom children because dom elements could not find <body> before
        function traceDomElements(component: VirtualElement) {
            component.realChildren.forEach((child: VirtualElement) => {
                if (child.type === 'component') traceDomElements(child)
                else if ('trace' in child && typeof child.trace === 'function') child.trace()
            })
        }

        mainComponent.trace()
        traceDomElements(mainComponent)
    }

    return {clientTemplates, serverTemplates, entry: entryHash}
}
