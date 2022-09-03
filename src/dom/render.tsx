import {ElementId, VirtualElement} from "../jsx/VirtualElement";
import {validTags, voidElements} from "./html-props";
import Document from "./default-document";

export default function render(element): string {
    const phantomBodyId = new ElementId(0, null, <body/>)
    let html = element.render(0, phantomBodyId)
    if (!html.startsWith('<html'))
        html = render(<Document>{html}</Document>)
    else
        html = '<!DOCTYPE html>' + html
    return html
}

export function renderElement(element: VirtualElement): string {
    if (element.type === 'function')
        return element.function({...element.props, children: element.children}).render(0, element.id)

    if (!validTags.includes(element.type as string))
        throw new Error(`\`${element.type}\` is not a valid element tag.`)

    const stringifiedProps: string =
        Array.from(Object.keys(element.props))
            .map(prop => {
                const htmlPropName = prop === 'className' ? 'class' : prop
                if ([undefined, null].includes(element.props[prop]))
                    return false

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

    const renderedChildren: string = element.children.flat()
        .filter(v => v)
        .map((child, i) => {
            if (child instanceof VirtualElement)
                return child.render(i, element.id)
            // todo: handle objects
            return child.toString() // todo: escape html
        })
        .join('')

    return openingTag +
        renderedChildren +
        closingTag
}
