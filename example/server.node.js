import path from 'path'
import express from 'express'
import './compiler.mjs'

import PrettyError from 'pretty-error'

const app = express()
const pe = new PrettyError()

app.use(express.static(path.resolve('.cc', 'client')))

let importCounter = 0
app.get('/', async (req, res) => {
    try {
        const out = (await import(`../.cc/server/main.mjs?ignoreCacheNonce=${importCounter++}`)).default
        res.send(out())
    } catch (err) {
        console.log(pe.render(err))
        res.status(500).send('Internal Error')
    }
})

app.listen(3000)
