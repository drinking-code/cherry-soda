import express, {Router} from 'express'
import PrettyError from 'pretty-error'

import './utils/bun-project-root.js'
import console from './utils/console.js'
import render, {startWatching} from './server/render.js'
import {outputPath as assetsOutputPath} from './server/compiler/assets.js'

const pe = new PrettyError()

/**
 * @param entry Absolute path to entry file
 * */
export default function cherryCola(entry) {
    process.env.CHERRY_COLA_ENTRY = entry
    startWatching()

    const router = new Router()
    router.use(express.static(assetsOutputPath))
    router.get('/', async (req, res) => {
        // todo: Bun server
        // todo: routing; next if request should not be handled
        // todo: serve static assets
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
