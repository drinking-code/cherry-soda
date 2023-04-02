import {getEntryHash, getServerTemplates} from '../compiler/template'
import {voidElements} from '../jsx/dom/html-props'
import {ensureArray} from '../utils/array'
import {mapObjectToArray} from '../utils/iterate-object'
import {ServerTemplateNodeType, ServerTemplatesMapType} from '../compiler/template/types'
import {HashType} from '../jsx/VirtualElement'
import {callComponentRenderFunctions} from '../state/side-effect'
import {isStateUsage} from '../state/state-usage'
import {ifError} from 'assert'
import {transformProps} from '../compiler/template/check-props'

export function getRenderer(hash?: HashType) {
    return () => {
        // todo: create copy of everything to handle simultaneous requests properly
        const serverTemplates: ServerTemplatesMapType = getServerTemplates()
        const entry: HashType = hash ?? getEntryHash()

        function renderTemplate(key): string {
            const template = serverTemplates.get(key)

            function stringifyNodes(nodes: ServerTemplateNodeType[]): string {
                return nodes.map((node): string => {
                    switch (node.type) {
                        case 'component':
                            callComponentRenderFunctions(node.key)
                            return renderTemplate(node.key)
                        case 'dom-element':
                            const isVoidElement = ((tagName): tagName is typeof voidElements[number] =>
                                    voidElements.some(tag => tag === node.tagName)
                            )(node.tagName)
                            const stringifiedPropsArray = mapObjectToArray(node.props,
                                ([propKey, propValue]) => {
                                    if (isStateUsage(propValue))
                                        propValue = propValue.preRender()
                                    if (propKey === 'style' && Array.isArray(propValue))
                                        propValue = Object.assign(propValue.shift(), ...propValue)
                                    const object = transformProps({[propKey]: propValue})
                                    ;[[propKey, propValue]] = Array.from(Object.entries(object))
                                    return `${propKey}="${propValue}"`
                                })
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
