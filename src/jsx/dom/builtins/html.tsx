export default function Html({...props}: JSX.IntrinsicElements['html']) {
    return (
        <html {...props}>{props.children}</html>
    )
}
