import crypto from 'crypto'

export default class GetChangedFilesPlugin {
    assets = new Map()

    constructor(callback) {
        this.callback = callback
    }

    apply(compiler) {
        if (!this.callback) return
        compiler.hooks.emit.tap('GetChangedFilesPlugin', (compilation) => {
            let assets = Array.from(Object.entries(compilation.assets))
            const changedAssets = []
            for (const [fileName] of assets) {
                const asset = compilation.getAsset(fileName)
                const assetContent = asset.source.source()
                const contentHash = crypto.createHash('sha1').update(assetContent).digest('base64')
                if (!this.assets.has(fileName)) {
                    this.assets.set(fileName, contentHash)
                } else if (this.assets.get(fileName) !== contentHash) {
                    changedAssets.push(fileName)
                    this.assets.set(fileName, contentHash)
                }
            }
            this.callback(changedAssets)
        })
    }
}
