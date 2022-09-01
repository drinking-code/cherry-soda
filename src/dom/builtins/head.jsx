export default function Head({children, ...props}) {
    const charset = children.find(<meta charSet/>) ?? <meta charSet={'UTF-8'}/>
    delete children[children.indexOf(charset)]
    const title = children.find(<title/>) ?? <title>Title</title>
    delete children[children.indexOf(title)]

    return (
        <head {...props}>
            {charset}
            {title}
            {children}
            <link rel={'stylesheet'} href={'/style.css'}/>
            {/* todo: add assets dynamically */}
        </head>
    )
}
