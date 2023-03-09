import chalk from 'chalk'
import open from 'open'

import cherryCola from '#server/bun'

Bun.serve({
    fetch: cherryCola(process.env.CHERRY_COLA_ENTRY),
    port: Number(process.env.PORT),
})

const url = `http://localhost:${process.env.PORT}`
console.log(chalk.magenta('dev server: ') + `listening at ${url}`)
setTimeout(() => open(url), 100)
