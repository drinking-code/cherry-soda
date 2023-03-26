export default function Bundle() {
    // todo: implement with sideEffect
    /*const assets = clientAssets.use(volumeAndPath => {
        const assetFiles = volumeAndPath.fs.readdirSync(volumeAndPath.outputPath) as string[]
        return assetFiles
            .filter(asset => ['.css', '.js']
                .map(suffix => asset.endsWith(suffix))
                .includes(true)
            ) // todo: filter out assets (chunks) that are not needed
            .map(asset => {
                if (!asset.startsWith('/'))
                    asset = '/' + asset
                if (asset.endsWith('.css'))
                    return <link rel={'stylesheet'} href={asset}/>
                else if (asset.endsWith('.js')) // todo: don't include if file empty
                    return <script src={asset} defer/>
            })
    })*/
    return /*assets*/<></>
}
