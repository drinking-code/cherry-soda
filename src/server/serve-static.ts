import path from 'path'
import * as nfs from 'fs'

import mime from 'mime'

import {getBundlerReadyPromise} from '../compiler/bundler/bundler-ready-promise'

export default function serveStatic(outputPath: string, fs: { existsSync: Function, readFileSync: Function } = nfs): (req: Request) => Promise<Response> {
    return async (req) => {
        await getBundlerReadyPromise()
        const url = new URL(req.url)
        const filePath = path.join(outputPath, url.pathname)
        if (url.pathname === '/' || !fs.existsSync(filePath))
            return new Response('', {status: 404})

        // return new Response(Bun.file(filePath))
        const mimeType = mime.getType(path.extname(url.pathname).substring(1))
        return new Response(fs.readFileSync(filePath), {
            headers: {
                // 'Content-Encoding': 'gzip'
                'Content-Type': mimeType,
            }
        })
    }
}
