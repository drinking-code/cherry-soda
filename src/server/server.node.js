import express from 'express'
import {outputPath as serverOutputPath} from './compiler.node.js'
import {outputPath as clientOutputPath} from './compiler.js'

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
        const out = (await import(`${serverOutputPath}/main.mjs?ignoreCacheNonce=${importCounter++}`)).default
        res.send(out())
    } catch (err) {
        console.log(pe.render(err))
        res.status(500).send('Internal Error')
    }
})

app.listen(3000, () => {
    console.log(chalk.magenta('dev server: ') + 'listening at http://localhost:3000')
})
