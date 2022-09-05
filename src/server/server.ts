import {render} from '../index'
import './compiler.assets.js'
import CraTemplate from '../../example/cherry-cola-template'

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
