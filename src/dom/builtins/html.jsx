export default function Html({...props}) {
    return (
        <html {...props}>{props.children}</html>
    )
}
