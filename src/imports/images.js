import fs from 'fs'
import crypto from 'crypto'

export const imageLoader = {
    name: 'image-loader',
    setup(builder) {
        builder.onLoad({filter: /\.(svg|jpe?g|png|webp)$/}, (args) => {
            // returns the path to the image
            // also emits the image (only for the asset compilation)
            const originalFileName = (args.path.match(/\/[^/]+$/) ?? [])[0]
            const contentHash = crypto
                .createHash('sha1')
                .update(fs.readFileSync(args.path))
                .digest('hex')
                .substring(0, 8)
            const newFileName = originalFileName.replace(/\.([^.]+)$/, `-${contentHash}.$1`)

            return (typeof Bun !== 'undefined')
                ? {
                    exports: {default: newFileName},
                    loader: 'object',
                }
                : {
                    contents: `const imageUrl = '${newFileName}'\n` +
                        'export default imageUrl',
                    loader: 'js',
                }
        })
    },
}

if (typeof Bun !== 'undefined')
    import('bun').then(({plugin}) => plugin(imageLoader))
