import {VirtualElement} from '../VirtualElement'
import {ElementChildren} from '../ElementChildren'
import {Fragment} from '../factory'
import Document from './default-document'
import {validTags, voidElements} from './html-props'
import stringifyProps from "./stringify-props";
import stringifyChildren from "./stringify-children";

export default function render(element): string {
    let html = element.render(0)

    // if "element" is a fragment, "element.render" returns an array
    if (Array.isArray(html))
        html = html.join('')

    if (!html.startsWith('<html')) {
        html = render(<Document>{html}</Document>)
    } else {
        html = '<!DOCTYPE html>' + html
    }

    return html
}

export function renderElement(element: VirtualElement): string | string[] {
    if (element.type === 'function')
        return element
            .function({...element.props, children: element.children})
            .render(0, element.id)

    const filteredChildren: ElementChildren = element.children.flat().filter(v => v)
    const renderedChildren: string[] = 'unsafeInnerHtml' in element.props
        ? [element.props['unsafeInnerHtml']]
        : stringifyChildren(filteredChildren, element.id)

    // @ts-ignore
    if (element.type === Fragment)
        return Array.from(renderedChildren)

    if (!validTags.includes(element.type as string))
        throw new Error(`\`${element.type}\` is not a valid element tag.`)

    const stringifiedProps: string = stringifyProps(element.props)
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
