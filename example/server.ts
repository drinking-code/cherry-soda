import {render} from '../src'
import './compiler.mjs'
import CraTemplate from './cra-template'

Bun.serve({
    fetch(req) {
        return new Response(CraTemplate(), {
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
