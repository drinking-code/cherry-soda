import path from 'path'
import {Plugin} from 'esbuild'

export interface UseFsOptions {
    fs?: any
}

export function useFs(options: UseFsOptions): Plugin {
    return {
        name: 'image-loader',
        setup(builder) {
            builder.onResolve({filter: /^\/(_virtual-files\/|input\.js)/}, args => {
                if (args.kind === 'entry-point')
                    return {path: args.path}
                else
                    return {path: path.join(args.resolveDir, args.path).replace(/^\.?\//, '/')}
            })
            builder.onLoad({filter: /./}, args => {
                const contents = options.fs.readFileSync(args.path, 'utf8')
                return {
                    contents: contents,
                    loader: 'default',
                }
            })
        }
    }
}
