import escapeHtml from 'escape-html'

import {ElementChildren} from '../ElementChildren'
import {ElementId, isVirtualElement} from '../VirtualElement'
import isState from '../../state/is-state'

export default function stringifyChildren(children: ElementChildren, elementId: ElementId): Array<string> {
    let elementIndex = 0, textIndex = 0
    return children
        .map((child) => {
            if (isVirtualElement(child)) {
                child.props.ref?.populate(child)
                const rendered = child.render(elementIndex++, elementId)
                if (Array.isArray(rendered)) {
                    elementIndex += rendered.length - 1
                    return rendered.join('')
                }
                return rendered
            }
            console.log(isState(child), elementId.fullPath, textIndex++, elementId.element.type)
            // todo: handle objects
            return escapeHtml(child.toString())
        })
}
