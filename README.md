<div align="center">
    <img width="300" height="300" src="/img/logo.svg" alt="cherry-cola">
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

## Test the waters, dip a toe

If you just to test out cherry-cola, you can run the examples. For that you need to have either [Bun](https://bun.sh)
(recommended) or [Node](https://nodejs.org) (16 or higher) installed. Then, clone the repository, install the
dependencies with either `bun i` (for Bun), or `npm i` (for Node). Use [cherry-cola's cli](#cli) to run an example:

```shell
cli/index dev example/cherry-cola-template/index.jsx
```

or, if you use Node:

```shell
cli/index dev --node example/cherry-cola-template/index.jsx`
```

Visit `localhost:3000` and / or edit files in `example/cherry-cola-template/`. To test out the other examples, use the
respective `index.jsx` as an argument instead.

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

Alternatively, you can use the [`cherryCola()`](#cherrycolaentry-string) function in your own server to render the app.
This also automatically
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

### Dev server (HMR-like)

Cherry-cola doesn't use webpack, so HMR isn't really an option. However, cherry-cola provides a feature (preliminarily
called dynamic code synchronisation) to reflect changes made to your code in the browser immediately after saving. It is
automatically activated with the `cherry-cola dev` command.  
For usage with a custom server use the `dynamicCodeSynchronisation()` function.

For Express in Node:

```javascript
// main.js
import cherryCola, {dynamicCodeSynchronisation} from 'cherry-cola/express'

// ... server stuff

const server = app.listen(3000)
dynamicCodeSynchronisation(server)
```

## Guides

### Add client-side code

In a function component typically all code is executed on the server. To execute code on the client you can use
the [`doSomething()`](#dosomethingcallback-args-any--void-dependencies-any) function. The function you provide here will
only be executed on the client. All dependencies (variables, functions, etc.) you use in this function that are not
native to the browser mut be provided through an array, because the function context will be different on the client.  
To refer to an element that the component returns you can use refs (similar to React) with `createRef()`, which you will
also need to pass in the array. Inside [`doSomething()`](#dosomethingcallback-args-any--void-dependencies-any) a ref
will be the actual node of the DOM. States can also be passed in the dependency array. A state will be passed to the
function as an array of the state and a function to change the state.  
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

### CLI

**Usage:** `cherry-cola <command> [options] <entry>`

`<entry>` is the file you want to use as an entrypoint. This file should export a function `main()`. (See
[Rendering and function components](#rendering-and-function-components)). For `cherry-cola start` this is used as an
"id" to find the correct files generated by `cherry-cola build`.

**Global options:**

- `--help` Print help (globally or for respective command)
- `--version` Print version

#### `build`

`cherry-cola build [options] <entry>`  
Compile code files and build assets for the client (and for Node, if specified) for this entrypoint.

[//]: # (todo: multiple entrypoints? be able to compile multiple apps, and also serve maybe multiple?)

**Options:**

- `--node` Use Node instead of Bun

[//]: # (todo: option for static site generation)

#### `start`

`cherry-cola start [options] <entry>`  
Start the built-in webserver (in production mode). You first must run `cherry-cola build` in order to
for `cherry-cola start` to run properly.

**Options:**

- `--node` Use Node instead of Bun
- `--port` Specify the port to be used

#### `dev`

`cherry-cola dev [options] <entry>`  
Start the built-in webserver (in development mode). This also compiles code files and build assets (and for Node, if
specified) for development, and watches for any changes to update the server and all connected clients.

**Options:**

- `--node` Use Node instead of Bun
- `--port` Specify the port to be used

### Rendering and function components

#### Rendering

##### `cherryCola(entry: string)`

To render an app, you can use the `cherryCola()` function. It returns either a request handler for `Bun.serve()` if you
import from `cherry-cola/bun`, or an Express router if imported from `cherry-cola/express`. In dev mode this function
also handles compiling / building and watching all the files belonging to you app.

**Parameters:**

- `entry: string` Absolute path to the [entry file](#entry-file)

**Returns:**

Both handle all requests with the app given as `entry` and serves all related (built) assets.

- `Express.Router`, if imported from `cherry-cola/express`
- `(req: Request) => Response`, if imported from `cherry-cola/bun`

#### Entry file

Every cherry-cola app has a single entry file. This file exports a function `main()`, which returns the main function
component (usually called `<App/>`). If this component does not yield a `<html>` tag, cherry-cola will automatically
wrap the resulting html in a standard document.

#### Function components

Cherry-cola function components look similar to React's function components. They are a function that accept props as a
parameter and return a component. The difference to React's function components is that intrinsically, none of the code
in the function gets send to the browser, apart from the resulting HTML after the rendering process. All code in
function components gets executed on the server.  
Internally, function components are called immediately after they change which can cause unexpected effects for example
when a function components writes to a database. To fix that, you can use the
[`sideEffect()`](#sideeffectcallback-args-any--void) function to tell cherry-cola that you want to execute this code
only for a request.  
If you want to execute code on the component in the browser, you can use the
[`doSomething()`](#dosomethingcallback-args-any--void-dependencies-any) function. Cherry-cola collects the code gives as
a function to `doSomething()` at build time and compiles it together with the other `doSomething()`s into one file.
Because of this, you must pass all dependencies (i.e. variables that are not globally defined in the browser's
javascript context) to the function in the dependency array.

##### `sideEffect(callback: (...args: any[]) => void)`

##### `doSomething(callback: (...args: any[]) => void, dependencies: any[])`

This function lets you execute code in the browser

### Refs

### States

### Location and Routing

### Essential built-in components

### Islands
