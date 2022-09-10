import fs from 'fs'
import crypto from 'crypto'
import path from 'path'

/**
 * @typedef {object} ImageLoaderOptions
 * @property {boolean} [emit]
 * @property {string} [path]
 * */
/**
 * @param {ImageLoaderOptions} options
 * */
export function imageLoader(options) {
    return {
        name: 'image-loader',
        setup(builder) {
            builder.onLoad({filter: /\.(svg|jpe?g|png|webp)$/}, (args) => {
                // returns the path to the image
                // also emits the image (only for the asset compilation)
                const originalFileName = (args.path.match(/\/[^/]+$/) ?? [])[0]
                const fileContents = fs.readFileSync(args.path)
                const contentHash = crypto
                    .createHash('sha1')
                    .update(fileContents)
                    .digest('hex')
                    .substring(0, 8)
                const newFileName = originalFileName.replace(/\.([^.]+)$/, `-${contentHash}.$1`)
                if (options.emit !== false && options.path) {
                    fs.mkdirSync(options.path, {recursive: true})
                    fs.writeFileSync(path.join(options.path, newFileName), fileContents)
                }

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
        }
    }
}
