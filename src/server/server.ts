import '../compiler/assets'

let importCounter = 0
Bun.serve({
    async fetch(req: Request) {
        const App = (await import(`${process.env.CHERRY_COLA_ENTRY}`)).default
        return new Response('render(App())', {
            headers: {
                "Content-Type": "text/html; charset=utf-8"
            }
        });
    },
    error(error: Error) {
        console.log(error)
        return new Response("Uh oh!!\n" + error.toString(), {status: 500});
    },
    port: Number(process.env.PORT),
})

console.log(/*chalk.magenta*/('dev server: ') + `listening at http://localhost:${process.env.PORT}`)
