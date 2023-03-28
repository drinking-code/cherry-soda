export default function Body({...props}: JSX.IntrinsicElements['body']) {
    return (
        <body {...props}>
        {props.children}
        </body>
    )
}
