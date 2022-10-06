<h1 align="center">
    <img width="300" src="/img/logo.svg" alt="cherry-cola">
</h1>
Yet another DIwhy JavaScript framework that nobody needs. It reminds of React, but has fundamentally a different approach.  
Instead of rendering HTML on the client (or on the server and then hydrate on the client), cherry-cola is intended to render on the server and only altered and not hydrated on the client. Similar to React, you specify components that return JSX in order to generate HTML on the server, but you also specify code that will be run on the client. Oh, and it works with Bun (:.

> **Warning**
> Cherry-cola is experimental. All APIs are subject to change.

<div align="center">
    <a href="#get-startet">Get startet</a> | <a href="#reference">Reference</a>
</div>

## Get startet

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

`index.js` is the main entrypoint for cherry-cola. cherry-cola will look for an exported function `main()` and will take the returned value to render HTML. `App.js` is an example function component similar to a React component.

Run `cherry-cola dev src/index.js` to start the dev server with Bun, or `cherry-cola dev --node src/index.js` to run with Node. Then, visit `localhost:3000`.

## Reference
