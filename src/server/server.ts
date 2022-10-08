import cherryCola from '#server/bun'
import chalk from 'chalk'

Bun.serve({
    fetch: cherryCola(process.env.CHERRY_COLA_ENTRY),
    port: Number(process.env.PORT),
})

console.log(chalk.magenta('dev server: ') + `listening at http://localhost:${process.env.PORT}`)
