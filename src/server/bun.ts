import compile from '../compiler'
import serveStatic from './serve-static'
import {getRenderer} from '../renderer/renderer'

/**
 * @param entry Absolute path to entry file
 * */
export default function cherrySoda(entry): (req: Request) => Promise<Response> {
    process.env.CHERRY_SODA_ENTRY = entry
    const {fs, outputPath} = compile(entry, process.env.BUN_ENV === 'development')
    const render = getRenderer()
    let serveStaticListener: (req: Request) => Promise<Response> = serveStatic(outputPath, fs)

    return async (req) => {
        // todo: routing; next if request should not be handled
        const res: Response = await serveStaticListener(req)
        if (res.status < 400) return res
        // try {
        return new Response(render(), {
            headers: {
                "Content-Type": "text/html; charset=utf-8"
            }
        })
        /*} catch (err) {
            console.error('Error during rendering:')
            console.log(pe.render(err))
            return new Response('Internal Error', {
                status: 500
            })
            // todo: show error in frontend in dev mode
        }*/
    }
}
