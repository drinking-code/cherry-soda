import {isVirtualElement, VirtualElement} from '../VirtualElement'
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

export function isElementChildren(value: VirtualElement | ElementChildren): value is ElementChildren {
    return typeof value[Symbol.iterator] === 'function'
}

export function renderElement(element: VirtualElement): string | string[] {
    if (element.type === 'function') {
        const returnedValue = element
            .function({...element.props, children: element.children})
        if (isElementChildren(returnedValue)) {
            return Array.from(returnedValue).map((el, i) => el.render(i, element.id))
        } else {
            return returnedValue.render(0, element.id)
        }
    }

    if (!validTags.some(tag => tag === element.type))
        throw new Error(`\`${element.type}\` is not a valid element tag.`)

    const stringifiedProps: string = stringifyProps(element.props)
    const openingTag: string =
        `<${element.type} ${stringifiedProps}>`
            .replace(/ >/, '>')

    if (voidElements.some(tag => tag === element.type))
        return openingTag

    const filteredChildren: ElementChildren = element.children.flat().filter(v => v)
    const renderedChildren: string[] = 'unsafeInnerHtml' in element.props
        ? [element.props.unsafeInnerHtml]
        : stringifyChildren(filteredChildren, element.id)

    const closingTag: string = `</${element.type}>`

    return openingTag +
        renderedChildren.join('') +
        closingTag
}
