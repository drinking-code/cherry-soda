import {createState, sideEffect} from '#cherry-soda'
import {getVolume, outputPath} from '../../../compiler/client-script/volume'

export default function Bundle() {
    // todo: implement with sideEffect
    const assets = createState<string[]>([])
    sideEffect(([assets, setAssets]) => {
        setAssets(getVolume().readdirSync(outputPath) as string[])
    }, [assets])
    return <>
        {assets.use(assetFiles => {
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
        })}
    </>
}
