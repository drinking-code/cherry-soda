export default function Head({children, ...props}) {
    const charset = children.find(<meta charSet/>) ?? <meta charSet={'UTF-8'}/>
    delete children[children.indexOf(charset)]
    const title = children.find(<title/>) ?? <title>Title</title>
    delete children[children.indexOf(title)]
    // console.log(global['cherry-cola'].clientAssets)
    const assets = global['cherry-cola'].clientAssets
        .map(asset => asset.name)
        .filter(asset =>
            ['.css', '.js']
                .map(suffix => asset.endsWith(suffix))
                .includes(true)
        ) // todo: add js files and filter out assets that are not needed
        .map(asset => {
            if (!asset.startsWith('/'))
                asset = '/' + asset
            if (asset.endsWith('.css'))
                return <link rel={'stylesheet'} href={asset}/>
            else if (asset.endsWith('.js'))
                return <script src={asset} defer/>
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
