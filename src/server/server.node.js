import express from 'express'
import shrinkRay from 'shrink-ray-current'
import chalk from 'chalk'

import console from '../utils/console.js'
import dynamicCodeSynchronisation from './dynamic-code-synchronisation/websocket.js'
import cherryCola from '#server/express'

const app = express()

app.use(shrinkRay())
app.use(cherryCola(process.env.CHERRY_COLA_ENTRY))

const server = app.listen(Number(process.env.PORT), () => {
    console.log(chalk.magenta('Dev-Server: ') + `Listening at http://localhost:${process.env.PORT}`)
})

dynamicCodeSynchronisation(server)
