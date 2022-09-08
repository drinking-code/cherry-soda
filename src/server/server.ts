import {outputPath as serverOutputPath} from "./compiler/node";

let importCounter = 0
Bun.serve({
    async fetch(req) {
        const App = (await import(`${serverOutputPath}/App.mjs?ignoreCacheNonce=${importCounter}&from=server`)).default
        const {render} = await import(`${serverOutputPath}/cherry-cola.mjs?ignoreCacheNonce=${importCounter++}&from=server`)
        return new Response(render(App()), {
            headers: {
                "Content-Type": "text/html; charset=utf-8"
            }
        });
    },
    error(error: Error) {
        return new Response("Uh oh!!\n" + error.toString(), {status: 500});
    },
    port: 3000,
})
