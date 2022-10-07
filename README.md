<div align="center">
    <img width="300" src="/img/logo.svg" alt="cherry-cola">
</div>
<div align="center">
    <a href="#get-started">Get started</a>
    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
    <a href="#guides">Guides</a>
    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
    <a href="#reference">Reference</a>
</div>

---

Yet another DIwhy JavaScript framework that nobody needs. It reminds of React, but has fundamentally a different
approach.  
Instead of rendering HTML on the client (or on the server and then hydrate on the client), cherry-cola is intended to
render on the server and only altered and not hydrated on the client. Similar to React, you specify components that
return JSX in order to generate HTML on the server, but you also specify code that will be run on the client. Oh, and it
works with Bun (:


> **Warning**&nbsp;&nbsp;
> Cherry-cola is experimental. All APIs are subject to change.

## Get started

In a new Bun / Node project add an `src/index.js` and an `src/App.js`:

```javascript
// src/index.js
import App from './App'

export function main() {
    return <App/>
}
```

```javascript
// src/App.js
export default function App() {
    return (
        <h1>Hello world!</h1>
    )
}
```

`index.js` is the main entrypoint for cherry-cola. cherry-cola will look for an exported function `main()` and will take
the returned value to render HTML. `App.js` is an example function component similar to a React component.

Run `cherry-cola dev src/index.js` to start the dev server with Bun, or `cherry-cola dev --node src/index.js` to run
with Node. Then, visit `localhost:3000`.

Alternatively, you can use the `cherryCola()` function in your own server to render the app. This also automatically
serves generates asset files (CSS, images, etc.).  
For Bun.serve:

```javascript
// main.js
import cherryCola from 'cherry-cola/bun'

const cherryColaApp = cherryCola('src/index.js')

Bun.serve({
    async fetch(req) {
        const url = new URL(req.url)
        if (url.pathname.startsWith('/api'))
            return new Response() // your custom responses
        return await cherryColaApp(req)
    },
    port: 3000,
})
```

or for Express in Node:

```javascript
// main.js
import cherryCola from 'cherry-cola/express'

const app = express()

app.all('/api', (req, res, next) => {
    // your custom responses
})
app.use(await cherryCola(process.env.CHERRY_COLA_ENTRY))
app.listen(3000)
```

## Guides

### Add client-side code

In a function component typically all code is executed on the server.

## Reference
