import extractTemplates, {ServerTemplateNodeType, ServerTemplatesMapType} from '../compiler/template'
import {voidElements} from '../jsx/dom/html-props'
import {ensureArray} from '../utils/array'
import {mapObjectToArray} from '../utils/iterate-object'

export function getRenderer(template: ReturnType<typeof extractTemplates>) {
    let serverTemplates: ServerTemplatesMapType, entry: number
    ;(async () => {
        const resolvedTemplate = await template
        serverTemplates = resolvedTemplate.serverTemplates
        entry = resolvedTemplate.entry
    })()
    return () => {
        function renderTemplate(key): string {
            const template = serverTemplates.get(key)

            function stringifyNodes(nodes: ServerTemplateNodeType[]) {
                return nodes.map(node => {
                    switch (node.type) {
                        case 'component':
                            return renderTemplate(node.key)
                        case 'dom-element':
                            const isVoidElement = ((tagName): tagName is typeof voidElements[number] =>
                                    voidElements.some(tag => tag === node.tagName)
                            )(node.tagName)
                            if (isVoidElement) {
                                return `<${node.tagName}/>`
                            } else {
                                const children = ensureArray(node.children)
                                const stringifiedChildren = children.length > 0 ? stringifyNodes(children) : ''
                                const stringifiedPropsArray = mapObjectToArray(node.props,
                                    ([propKey, propValue]) => `${propKey}="${propValue}"`
                                )
                                const stringifiedProps = stringifiedPropsArray.length > 0 ? ' ' + stringifiedPropsArray.join(' ') : ''
                                return `<${node.tagName}${stringifiedProps}>${stringifiedChildren}</${node.tagName}>`
                            }
                        case 'text':
                            return node.content
                    }
                }).join('')
            }

            return stringifyNodes(template)
        }

        return renderTemplate(entry)
    }
}
