import {VirtualElement} from "../jsx/VirtualElement";
import {validTags, voidElements} from "./html-props";
import Document from "./default-document";

export default function render(element): string {
    let html = element.render()
    if (!html.startsWith('<html'))
        html = render(<Document>{html}</Document>)
    else
        html = '<!DOCTYPE html>' + html
    return html
}

export function renderElement(element: VirtualElement): string {
    if (element.type === 'function')
        return element.function({...element.props, children: element.children}).render()

    if (!validTags.includes(element.type as string))
        throw new Error('`${element.type}` is not a valid element tag.')

    const stringifiedProps: string = Array.from(Object.keys(element.props)).map(prop => {
        const htmlPropName = prop === 'className' ? 'class' : prop
        if ([undefined, null].includes(element.props[prop])) return false
        return `${htmlPropName}="${element.props[prop]}"`
    }).filter(v => v).join(' ')

    const openingTag: string = `<${element.type} ${stringifiedProps}>`.replace(/ >/, '>')
    if (voidElements.includes(element.type as string))
        return openingTag

    const closingTag: string = `</${element.type}>`

    return openingTag + element.children.flat().map(child => {
        if (child instanceof VirtualElement)
            return child.render()
        // todo: handle objects
        return child // todo: escape html
    }).join('') + closingTag
}
