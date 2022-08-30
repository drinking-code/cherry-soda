import path from 'path'
import express from 'express'
import './compiler.mjs'

const app = express()

app.use(express.static(path.resolve('.cc', 'client')))

app.get('/', async (req, res) => {
    const out = (await import('../.cc/server/main.mjs')).default
    res.send(out())
})

app.listen(3000)
