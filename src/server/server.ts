import cherryCola from "./bun";

Bun.serve({
    fetch: cherryCola(process.env.CHERRY_COLA_ENTRY),
    port: Number(process.env.PORT),
})

console.log(/*chalk.magenta*/('dev server: ') + `listening at http://localhost:${process.env.PORT}`)
