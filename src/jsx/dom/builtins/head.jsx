import {default as iposPromise} from '../../../ipos.js'

let ipos
;(async () => {
    ipos = await iposPromise
})()

export default function Head({children, ...props}) {
    const charset = children.find(<meta charSet/>) ?? <meta charSet={'UTF-8'}/>
    delete children[children.indexOf(charset)]
    const title = children.find(<title/>) ?? <title>Title</title>
    delete children[children.indexOf(title)]
    const assets = ipos.clientAssets
        .filter(asset =>
            ['.css', '.js']
                .map(suffix => asset.endsWith(suffix))
                .includes(true)
        ) // todo: filter out assets (chunks) that are not needed
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
