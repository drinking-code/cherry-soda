import PrettyError from 'pretty-error'

import compile from '../compiler'
import serveStatic from './serve-static'

const pe = new PrettyError()

/**
 * @param entry Absolute path to entry file
 * */
export default function cherryCola(entry): (req: Request) => Promise<Response> {
    process.env.CHERRY_COLA_ENTRY = entry
    const {fs, outputPath, render} = compile(entry)
    const serveStaticListener: (req: Request) => Response = serveStatic(outputPath, fs)

    return async (req) => {
        // todo: routing; next if request should not be handled
        const res: Response = serveStaticListener(req)
        if (res.status < 400) return res
        try {
            return new Response('<style>*{background:#222}</style>' + render(), {
                headers: {
                    "Content-Type": "text/html; charset=utf-8"
                }
            })
        } catch (err) {
            console.error('Error during rendering:')
            console.log(pe.render(err))
            return new Response('Internal Error', {
                status: 500
            })
            // todo: show error in frontend in dev mode
        }
    }
}
