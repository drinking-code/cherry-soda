import fs from 'fs'
import path from 'path'
import {Plugin} from 'esbuild'
import {BunPlugin} from 'bun'
import {numberToHex} from '../utils/numberToString'

interface ImageLoaderOptions {
    emit?: boolean
    path?: string
    fs?: any,
    bunPlugin?: boolean
}

export const imageFilter = /\.(svg|jpe?g|png|webp)$/

export default function imageLoader(options?: ImageLoaderOptions): Plugin | Parameters<BunPlugin>[0] {
    options ??= {}
    options = {
        emit: false,
        path: null,
        fs: fs,
        bunPlugin: false,
        ...options
    }
    return {
        name: 'image-loader',
        setup(builder) {
            builder.onLoad({filter: imageFilter}, args => {
                // returns the path to the image
                // also emits the image (only for the asset compilation)
                const originalFileName = (args.path.match(/\/[^/]+$/) ?? [])[0]
                const fileContents = fs.readFileSync(args.path)
                const contentHash = numberToHex(Bun.hash(fileContents) as number).substring(0, 8)
                const newFileName = originalFileName.replace(/\.([^.]+)$/, `-${contentHash}.$1`)
                if (options.emit !== false && options.path) {
                    options.fs.mkdirSync(options.path, {recursive: true})
                    options.fs.writeFileSync(path.join(options.path, newFileName), fileContents)
                }

                return {
                    contents: `const imageUrl = '${newFileName}'\n` +
                        'export default imageUrl',
                    loader: 'js',
                }
            })
        }
    }
}
