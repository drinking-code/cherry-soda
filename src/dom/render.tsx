import {ElementId, VirtualElement} from '../jsx/VirtualElement'
import {ElementChildren} from '../jsx/ElementChildren'
import {Fragment} from '../jsx/factory'
import Document from './default-document'
import {validTags, voidElements} from './html-props'
import callFunctionComponent from '../module-collector'

export default function render(element): string {
    let html = element.render(0)
    // in the case "element" is a fragment "element.render" returns an array
    if (Array.isArray(html))
        html = html.join('')
    if (!html.startsWith('<html'))
        html = render(<Document>{html}</Document>)
    else
        html = '<!DOCTYPE html>' + html
    return html
}

export function renderElement(element: VirtualElement): string | string[] {
    if (element.type === 'function')
        return callFunctionComponent(element)

    const filteredChildren: ElementChildren = element.children.flat().filter(v => v)
    let i = -1
    const renderedChildren: string[] = filteredChildren
        .map((child) => {
            i++
            if (child instanceof VirtualElement) {
                const rendered = child.render(i, element.id)
                if (Array.isArray(rendered)) {
                    i += rendered.length - 1
                    return rendered.join('')
                }
                return rendered
            }
            // todo: handle objects
            return child.toString() // todo: escape html
        })

    // @ts-ignore
    if (element.type === Fragment)
        return Array.from(renderedChildren)

    if (!validTags.includes(element.type as string))
        throw new Error(`\`${element.type}\` is not a valid element tag.`)

    const stringifiedProps: string =
        Array.from(Object.keys(element.props))
            .map(prop => {
                const htmlPropName = prop === 'className' ? 'class' : prop
                // todo: convert prop names like "charSet", "onClick", and "dataValue"
                if ([undefined, null].includes(element.props[prop]))
                    return false
                if (element.props[prop] === true)
                    return htmlPropName

                return `${htmlPropName}="${element.props[prop]}"`
            })
            .filter(v => v)
            .join(' ')

    const openingTag: string =
        `<${element.type} ${stringifiedProps}>`
            .replace(/ >/, '>')

    if (voidElements.includes(element.type as string))
        return openingTag

    const closingTag: string = `</${element.type}>`

    return openingTag +
        renderedChildren.join('') +
        closingTag
}
