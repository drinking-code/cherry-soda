import {VirtualElement} from '../jsx/factroy'

export default function render(element: VirtualElement) {
    return element.render()
}

const validTags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figure', 'footer', 'form', 'h', 'h', 'h', 'h', 'h', 'h', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rb', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr']
const voidElements = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']

export function renderElement(element: VirtualElement) {
    if (element.type === 'function')
        return element.function(element.props).render()

    if (!validTags.includes(element.type as string))
        throw new Error('`${element.type}` is not a valid element tag.')

    const stringifiedProps = Array.from(Object.keys(element.props)).map(prop => {
        const htmlPropName = prop === 'className' ? 'class' : prop
        if ([undefined, null].includes(element.props[prop])) return false
        return `${htmlPropName}="${element.props[prop]}"`
    }).filter(v => v).join(' ')
    const openingTag = `<${element.type} ${stringifiedProps}>`.replace(/ >/, '>')
    if (voidElements.includes(element.type as string))
        return openingTag

    const closingTag = `</${element.type}>`

    return openingTag + element.children.map(child => {
        if (child instanceof VirtualElement)
            return child.render()
        // todo: handle objects
        return child
    }).join('') + closingTag
}
