import {messages as errors, makeError} from '../messages/errors'

export function parseTemplate(template: string) {
    // console.log(makeError(errors.templateParser.invalidTemplate, [template]))
    console.log(makeError)
    // if (!template.startsWith('[')) throw makeError(errors.templateParser.invalidTemplate, [template])
}

parseTemplate('#')

/*
function htmlFromTemplate(templates: Map<number, TemplateType>, entry: number): string {
    function elementToHtml(elements: TemplateType): string {
        return elements.map(element => {
            const isText = ((el): el is TemplateTextType => el[0] === 0)(element)
            const isComponent = ((el): el is TemplateComponentType =>
                    !isText && typeof el[0] === 'number'
            )(element)
            const isHtmlElement = ((el): el is TemplateHTMLType => typeof el[0] === 'string')(element)
            if (isText) {
                return element[1]
            } else if (isHtmlElement) {
                const [tag, props, childrenOrChild] = element
                const stringifiedProps = props.map(([key, value]) => `${key}="${value}"`).join(' ')
                const stringifiedPropsWithSpace = stringifiedProps.length > 0 ? ' ' + stringifiedProps : ''
                const children = (<E = TemplateElementType>(value: E | E[]): E[] => {
                    const isTemplateElement = (value: E | E[]): value is E => !Array.isArray(value[0])
                    return isTemplateElement(value) ? [value] : value
                })(childrenOrChild)
                const stringifiedChildren = children.length > 0 && elementToHtml(children)
                return `<${tag}${stringifiedPropsWithSpace}>${stringifiedChildren}</${tag}>`
            } else if (isComponent) {
                return elementToHtml(templates.get(element[0]))
            }
        }).join('')
    }

    return elementToHtml(templates.get(entry))
}
*/
