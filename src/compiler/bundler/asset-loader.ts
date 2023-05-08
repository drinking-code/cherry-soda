import {loadFs} from './use-fs'

export const assetLoader = {
    name: 'asset-loader',
    setup(builder) {
        const fontExtensions = ['ttf', 'otf', 'woff2?', 'eot', 'svg']
        const imageExtensions = ['avif', 'gif',
            'p?jpe?g', 'jfif', 'pjp',
            'a?png', 'webp',
            'bmp', 'ico', 'cur', 'tiff?'
        ]
        const audioExtensions = [
            // todo
        ]
        const videoExtensions = [
            // todo
        ]
        const allExtensions = []
            .concat(fontExtensions)
            .concat(imageExtensions)
            .concat(audioExtensions)
            .concat(videoExtensions)
        const assetMatcher = new RegExp(`\.(${allExtensions.join('|')})$`)
        builder.onLoad({filter: assetMatcher}, args => {
            const {contents} = loadFs(null, args, 'buffer')
            if (contents.length < 2 * 1e3)
                return {
                    contents: contents,
                    loader: 'dataurl',
                }
            return {
                contents: contents,
                loader: 'file',
            }
        })
    }
}
