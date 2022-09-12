import express from 'express'
import PrettyError from 'pretty-error'
import shrinkRay from 'shrink-ray-current'
import chalk from 'chalk'

import './compiler/node.js'
import {outputPath as clientOutputPath} from './compiler/assets.js'
import dynamicCodeSynchronisation from './dynamic-code-synchronisation/websocket.js'
import render from './render.js'

const app = express()
const pe = new PrettyError()

app.use(shrinkRay())
app.use(express.static(clientOutputPath))

app.get('/', async (req, res) => {
    try {
        res.send(await render())
    } catch (err) {
        console.error('Error during rendering:')
        console.log(pe.render(err))
        res.status(500).send('Internal Error')
    }
})

const server = app.listen(Number(process.env.PORT), () => {
    console.log(chalk.magenta('Dev-Server: ') + `Listening at http://localhost:${process.env.PORT}`)
})

dynamicCodeSynchronisation(server)
