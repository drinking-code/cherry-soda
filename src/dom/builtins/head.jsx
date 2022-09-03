export default function Head({children, ...props}) {
    const charset = children.find(<meta charSet/>) ?? <meta charSet={'UTF-8'}/>
    delete children[children.indexOf(charset)]
    const title = children.find(<title/>) ?? <title>Title</title>
    delete children[children.indexOf(title)]
    const assets = global['cherry-cola'].currentStats.assets
        .map(asset => asset.name)
        .filter(asset =>
            ['.css']
                .map(suffix => asset.endsWith(suffix))
                .includes(true)
        ) // todo: add js files and filter out assets that are not needed
        .map(asset => {
            if (!asset.startsWith('/'))
                asset = '/' + asset
            if (asset.endsWith('.css'))
                return <link rel={'stylesheet'} href={asset}/>
        })

    return (
        <head {...props}>
            {charset}
            {title}
            {children}
            {assets}
            {/* todo: preload important non-code assets */}
        </head>
    )
}
