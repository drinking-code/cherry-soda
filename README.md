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

In a function component typically all code is executed on the server. To execute code on the client you can use
the `doSomething()` function. The function you provide here will only be executed on the client. All dependencies
(variables, functions, etc.) you use in this function that are not native to the browser mut be provided through an
array, because the function context will be different on the client.  
To refer to an element that the component returns you can use refs (similar to React) with `createRef()`, which you will
also need to pass in the array. Inside `doSomething()` a ref will be the actual node of the DOM.  
States can also be passed in the dependency array. A state will be passed to the function as an array of the state and a
function to change the state.  
Here is [example](/example/counter/App.jsx) to illustrate all those features:

```javascript
import {createRef, createState, doSomething, Fragment} from 'cherry-cola'

export default function Counter() {
    // create a state with an initial value `0`
    // the returned value is an extended "Number" object to track this state
    const count = createState(0)
    // two refs for the two buttons
    const addButton = createRef()
    const subtractButton = createRef()

    /* "doSomething" takes the function (client-side code) as the first 
     * and an array of dependencies as the second parameter.
     * The dependencies will be fed into the function in the same order as provided.
     * The "count" state gets converted into a (client-side) state
     * and a function to change the state's value.
     */
    doSomething(([count, setCount], addButton, subtractButton) => {
        /* "addButton" and "subtractButton" are now just DOM elements
         * and not a refence objects anymore.
         */
        addButton.addEventListener('click', () => {
            setCount(count + 1)
        })
        subtractButton.addEventListener('click', () => {
            setCount(Math.max(count - 1, 0))
        })
    }, [count, addButton, subtractButton])

    return (
        <Fragment>
            {/* The ref object must be passed here as "ref" to assign this node */}
            <button ref={addButton}>+</button>
            {/* The state object can be used here just like that. 
            It'll be converted to a number (or rather a string) internally. */}
            <span>Count: {count}</span>
            <button ref={subtractButton}>-</button>
        </Fragment>
    )
}
```

[//]: # (todo: also provide an example here on how to import a node module [or a different file] as a dependency)

### Route on the server, and the client will route, too

### Section you app with `<Island>`s

## Reference

### Rendering and function components

### Refs

### States

### Location and Routing 

### Essential built-in components

### Islands
