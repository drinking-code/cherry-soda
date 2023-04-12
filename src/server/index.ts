import {type Serve} from 'bun'

import '../imports'
import chalk from 'chalk'
import open from 'open'

import cherrySoda from './bun'

global.count = global.count ?? -1
global.count++

const serverOptions: Serve = {
    fetch: cherrySoda(process.env.CHERRY_COLA_ENTRY),
    port: Number(process.env.PORT),
}

if (!global.server) {
    global.server = Bun.serve(serverOptions)
} else {
    global.server.reload(serverOptions)
}

const url = `http://localhost:${process.env.PORT}`
if (global.count === 0) {
    console.log(chalk.magenta('dev server: ') + `listening at ${url}`)
    setTimeout(() => open(url), 200)
}
