import escapeHtml from 'escape-html'

import {ElementChildren} from '../ElementChildren'
import {ElementId, isVirtualElement} from '../VirtualElement'

export default function stringifyChildren(children: ElementChildren, elementId: ElementId): Array<string> {
    let i = -1
    return children
        .map((child) => {
            if (isVirtualElement(child)) {
                const rendered = child.render(/*++i, elementId*/)
                if (Array.isArray(rendered)) {
                    i += rendered.length - 1
                    return rendered.join('')
                }
                return rendered
            }
            // todo: handle objects
            return escapeHtml(child.toString())
        })
}
