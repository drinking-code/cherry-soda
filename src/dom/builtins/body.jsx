export default function Body({...props}) {
    return (
        <body {...props}>
            {props.children}
        </body>
    )
}
