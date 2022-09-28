import express, {Router} from 'express'
import PrettyError from 'pretty-error'

import '../utils/project-root.js'
import console from '../utils/console.js'
import {readyPromise} from '../compiler/node.lib.js'

const pe = new PrettyError()

/**
 * @param entry Absolute path to entry file
 * */
export default async function cherryCola(entry) {
    await readyPromise
    const {outputPath: assetsOutputPath} = await import('#node:compiler')
    const {default: render, startWatching} = await import('#node:render')
    process.env.CHERRY_COLA_ENTRY = entry
    startWatching()

    const router = new Router()
    router.use(express.static(assetsOutputPath))
    router.get('/', async (req, res) => {
        // todo: Bun server
        // todo: routing; next if request should not be handled
        try {
            // todo: render with app
            res.send(await render())
        } catch (err) {
            console.error('Error during rendering:')
            console.log(pe.render(err))
            res.status(500).send('Internal Error')
        }
    })

    return router
}
