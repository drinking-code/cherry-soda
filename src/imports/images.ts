import fs from 'fs'
import path from 'path'
import {type Plugin} from 'esbuild'
import {type BunPlugin} from 'bun'
import {numberToHex} from '../utils/number-to-string'
import {associateFile, cacheFileContent, getVolume, outputPath} from '../compiler/client-script/volume'

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
    // putting options in the plugins file results in segfault @ bun v0.5.8
    options = {
        fs: getVolume(),
        path: outputPath,
        emit: true,
    }
    return {
        name: 'image-loader',
        setup(builder) {
            builder.onLoad({filter: imageFilter}, args => {
                // returns the path to the image
                // also emits the image (only for the asset compilation)
                const originalFileName = (args.path.match(/\/[^/]+$/) ?? [])[0]
                const fileContents = fs.readFileSync(args.path)
                cacheFileContent(originalFileName, fileContents)
                const contentHash = numberToHex(Bun.hash(fileContents) as number, 8)
                const newFileName = originalFileName.replace(/\.([^.]+)$/, `-${contentHash}.$1`)
                associateFile(newFileName, originalFileName)
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
