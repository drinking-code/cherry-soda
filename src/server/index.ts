import '../imports'
import chalk from 'chalk'
import open from 'open'

import cherrySoda from '#server/bun'

Bun.serve({
    fetch: cherrySoda(process.env.CHERRY_COLA_ENTRY),
    port: Number(process.env.PORT),
})

const url = `http://localhost:${process.env.PORT}`
console.log(chalk.magenta('dev server: ') + `listening at ${url}`)
setTimeout(() => open(url), 100)
