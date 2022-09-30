import escapeHtml from 'escape-html'

import {ElementChildren} from '../ElementChildren'
import {ElementId, VirtualElement} from '../VirtualElement'

export default function stringifyChildren(children: ElementChildren, elementId: ElementId): Array<string> {
    let i = -1
    return children
        .map((child) => {
            i++
            if (isVirtualElement(child)) {
                const rendered = child.render(i, elementId)
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

function isVirtualElement(item): item is VirtualElement {
    // instanceof VirtualElement won't work in node because esbuild generates multiple files with the same class
    return item.constructor?.name === VirtualElement.name
}
