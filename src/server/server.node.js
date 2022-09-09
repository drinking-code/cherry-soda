import express from 'express'
import {outputPath as serverOutputPath} from './compiler/node.js'
import {outputPath as clientOutputPath} from './compiler/assets.js'
import './compiler/javascript.js'
import dynamicCodeSynchronisation from './dynamic-code-synchronisation/websocket.js'

import PrettyError from 'pretty-error'
import shrinkRay from 'shrink-ray-current'
import chalk from 'chalk'

const app = express()
const pe = new PrettyError()

app.use(shrinkRay())
app.use(express.static(clientOutputPath))

let importCounter = 0
app.get('/', async (req, res) => {
    try {
        const App = (await import(`${serverOutputPath}/App.mjs?ignoreCacheNonce=${importCounter}&from=server`)).default
        const {render} = await import(`${serverOutputPath}/cherry-cola.mjs?ignoreCacheNonce=${importCounter++}&from=server`)
        res.send(render(App()))
    } catch (err) {
        console.log(pe.render(err))
        res.status(500).send('Internal Error')
    }
})

const server = app.listen(Number(process.env.PORT), () => {
    console.log(chalk.magenta('dev server: ') + `listening at http://localhost:${process.env.PORT}`)
})

dynamicCodeSynchronisation(server)
