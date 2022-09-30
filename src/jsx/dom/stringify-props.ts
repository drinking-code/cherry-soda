export default function stringifyProps(props: { [key: string]: any }): string {
    return Array.from(Object.keys(props))
        .map(prop => {
            const htmlPropName = prop === 'className' ? 'class' : prop
            // todo: convert prop names like "charSet", "onClick", and "dataValue"
            if ([undefined, null].includes(props[prop]))
                return false
            if (props[prop] === true)
                return htmlPropName
            // todo: convert objects in "style" props and such

            return `${htmlPropName}="${props[prop]}"`
        })
        .filter(v => v)
        .join(' ')
}
