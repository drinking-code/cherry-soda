export default function Body({content, ...props}) {
    if (content) {
        return <body {...props} unsafeInnerHtml={content}/>
    } else
        return (
            <body {...props}>
            {props.children}
            </body>
        )
}
