import {getEntryHash, getServerTemplates} from '../compiler/template'
import {voidElements} from '../jsx/dom/html-props'
import {ensureArray} from '../utils/array'
import {mapObjectToArray} from '../utils/iterate-object'
import {ServerTemplateNodeType, ServerTemplatesMapType} from '../compiler/template/types'
import {HashType} from '../jsx/VirtualElement'

export function getRenderer(hash?: HashType) {
    return () => {
        const serverTemplates: ServerTemplatesMapType = getServerTemplates()
        const entry: HashType = hash ?? getEntryHash()

        function renderTemplate(key): string {
            const template = serverTemplates.get(key)

            function stringifyNodes(nodes: ServerTemplateNodeType[]): string {
                return nodes.map((node): string => {
                    switch (node.type) {
                        case 'component':
                            return renderTemplate(node.key)
                        case 'dom-element':
                            const isVoidElement = ((tagName): tagName is typeof voidElements[number] =>
                                    voidElements.some(tag => tag === node.tagName)
                            )(node.tagName)
                            const stringifiedPropsArray = mapObjectToArray(node.props,
                                ([propKey, propValue]) => `${propKey}="${propValue}"`
                            )
                            const stringifiedProps = stringifiedPropsArray.length > 0 ? ' ' + stringifiedPropsArray.join(' ') : ''
                            if (isVoidElement) {
                                return `<${node.tagName}${stringifiedProps}/>`
                            } else {
                                const children = ensureArray(node.children)
                                const stringifiedChildren = children.length > 0 ? stringifyNodes(children) : ''
                                return `<${node.tagName}${stringifiedProps}>${stringifiedChildren}</${node.tagName}>`
                            }
                        case 'text':
                            return node.content
                        case 'state':
                            return node.stateUsage.render()
                    }
                }).join('')
            }

            return stringifyNodes(template)
        }

        return renderTemplate(entry)
    }
}
