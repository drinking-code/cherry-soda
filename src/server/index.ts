import '../imports'
import chalk from 'chalk'
import open from 'open'

import cherrySoda from './bun'

global.count = global.count ?? -1
global.count++

Bun.serve({
    fetch: cherrySoda(process.env.CHERRY_COLA_ENTRY),
    port: Number(process.env.PORT),
})

const url = `http://localhost:${process.env.PORT}`
if (global.count === 0) {
    console.log(chalk.magenta('dev server: ') + `listening at ${url}`)
    setTimeout(() => open(url), 200)
}
