import express, {Router} from 'express'
import PrettyError from 'pretty-error'

import '../utils/project-root.js'
import console from '../utils/console.js'
import startNodeCompiler from '../compiler/node.lib.js'

export {default as dynamicCodeSynchronisation} from './dynamic-code-synchronisation/websocket.js'

const pe = new PrettyError()

/**
 * @param entry Absolute path to entry file
 * */
export default async function cherryCola(entry) {
    await startNodeCompiler()
    const {endEventListener} = await import('#node:compiler')
    const {default: render} = await import('#node:render-function')

    await new Promise(resolve => {
        function endHandler() {
            endEventListener.removeEventListener('end', endHandler)
            resolve()
        }

        endEventListener.addEventListener('end', endHandler)
    })

    const {outputPath: assetsOutputPath} = await import('#node:asset-compiler')
    process.env.CHERRY_COLA_ENTRY = entry

    const router = new Router()
    router.use(express.static(assetsOutputPath))
    router.get('/', async (req, res) => {
        // todo: routing; next if request should not be handled
        try {
            res.send(await render())
        } catch (err) {
            console.error('Error during rendering:')
            console.log(pe.render(err))
            res.status(500).send('Internal Error')
        }
    })

    return router
}
