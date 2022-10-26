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

Yet another JavaScript framework that nobody needs. It reminds of React, but does not render HTML on the client*.  
Instead of rendering HTML on the client (or on the server and then hydrate on the client), cherry-cola is intended to
render on the server and only alter the HTML (and not hydrate) on the client. Similar to React, you specify components
that return JSX in order to generate HTML on the server, but you also specify code that will be run on the client. Oh,
and it works with Bun (:

> *It does, technically. But way less than other frameworks.
> &nbsp;

> **Warning**&nbsp;&nbsp;
> Cherry-cola is experimental. Everything is subject to change.

## Test the waters, dip a toe

If you just to test out cherry-cola, you can run the examples. For that you need to have either [Bun](https://bun.sh)
(recommended) or [Node](https://nodejs.org) (16 or higher) installed. Then, clone the repository, install the
dependencies with either `bun i` (for Bun), or `npm i` (for Node). Use [cherry-cola's CLI](#cli) to run an example:

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

`index.js` is the main entry point for cherry-cola. It will look for an exported function `main()` and will
use the returned value to render HTML. `App.js` is an example function component similar to a React component.

Run `cherry-cola dev src/index.js` to start the dev server with Bun, or `cherry-cola dev --node src/index.js` to run
with Node. Then, visit `localhost:3000`.

Alternatively, you can use the [`cherryCola()`](#cherrycolaentry-string) function in your own server to render the app.
This also automatically serves the asset files (JavaScript, CSS, images, etc.).  
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
called dynamic code synchronisation) that reflects changes made to your code in the browser immediately after saving.
The `cherry-cola dev` command has this activated out of the box.  
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
the [`doSomething()`](#dosomethingcallback-args-any--void--function-dependencies-any) function. The function you provide
here will only be executed on the client. All "dependencies" for this function that must be provided through an array.
This is because the function context will be different on the client.  
To refer to an element that the component returns you can use refs (similar to React) with
[`createRef()`](#createref-ref), which you will also need to pass in the array. Inside
[`doSomething()`](#dosomethingcallback-args-any--void--function-dependencies-any) a ref will be the actual node of the
DOM. States can also be passed in the dependency array. A state will be passed to the function as an array of the state
and a function to change the state.  
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

`<entry>` is the file you want to use as an entry point. This file should export a function `main()` (see
[Rendering and function components](#rendering-and-function-components)). For `cherry-cola start` this is used as an
"id" to find the correct files generated by `cherry-cola build`.

**Global options:**

- `--help` Print help (globally or for respective command)
- `--version` Print version

#### `build`

`cherry-cola build [options] <entry>`  
Compile code files and build assets for the client (and for Node, if specified) for this entry point.

[//]: # (todo: multiple entrypoints? be able to compile multiple apps, and also serve maybe multiple?)

**Options:**

- `--node` Use Node instead of Bun

[//]: # (todo: option for static site generation)

#### `start`

`cherry-cola start [options] <entry>`  
Start the built-in web server (in production mode). You first must run `cherry-cola build` in order to
for `cherry-cola start` to run properly.

**Options:**

- `--node` Use Node instead of Bun
- `--port` Specify the port to be used

#### `dev`

`cherry-cola dev [options] <entry>`  
Start the built-in web server (in development mode). This also compiles code files and builds assets for the client (and
for Node, if specified). It also watches for any changes to update the server and all connected clients.

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

[//]: # (todo: document the element children find method)

#### Entry file

Every cherry-cola app has a single entry file. This file exports a function `main()`, which returns the main function
component (usually called `<App/>`). If this component does not yield a `<html>` tag, cherry-cola will automatically
wrap the resulting HTML in a standard document.

#### Function components

cherry-cola function components look similar to React's function components. They are a function that accept props as a
parameter and return a component. The difference to React's function components is that the function code itself does
not get send to the browser. All code in function components gets executed on the server.  
Internally, function components are called immediately after they change. This can cause unexpected effects for example
when a function components writes to a database. To fix that, you can use the
[`sideEffect()`](#sideeffectcallback-args-any--void) function to tell cherry-cola that you want to execute this code
only for a request.  
If you want to execute code on the component in the browser, you can use the
[`doSomething()`](#dosomethingcallback-args-any--void--function-dependencies-any) function. Cherry-cola collects the
code gives as a function to `doSomething()` at build time and compiles it together with the other `doSomething()`s into
one file.

##### `sideEffect(callback: (...args: any[]) => void)`

##### `doSomething(callback: (...args: any[]) => void | Function, dependencies: any[])`

This function lets you execute code in the browser. The function `callback` passed as the first parameter gets converted
to a string and compiled into a JavaScript file to be served to the browser. Because of this, you must pass all
dependencies to the function in the dependency array. Dependencies are all variables that are not already defined
globally or natively.  
The values you passed in the array will be passed in the same order into the `callback` function on the client. If you
pass a ref into the array, the passed value for the function will be the matching HTML element. And if you pass a state
into the array, the passed value for the function will be an array with the value as a [`Mutable`](#mutable-client-side)
as the first entry and a function for changing the value as the second entry.  
The callback function may return another function. This (returned) function will be called before the component's
elements are removed from the DOM. That happens for example when the client navigates to a different page. You can use
this function to clean up if you need to.

**Parameters:**

- `callback: (...args: any[]) => void | Function` A function with the code that you want to execute on the client. The
  function may return another function. The returned function will be called anytime the component's elements are
  removed from the DOM.
- `dependencies: any[]` An array with all dependencies for the callback function

### Refs

Refs are a way to work with the DOM nodes that your function components return. To use, get a reference instance by
calling the [`createRef()`](#createref-ref) function, and pass it to the desired element with the `ref` parameter. When
you use it inside a [`doSomething()`](#dosomethingcallback-args-any--void--function-dependencies-any) callback, it
becomes the actual DOM node on the client. You can also pass one ref to multiple elements. If you do that, the ref
becomes a `HTMLCollection` inside of a [`doSomething()`](#dosomethingcallback-args-any--void--function-dependencies-any)
callback.

#### `createRef(): Ref`

Returns a new `Ref`. Pass this to an element like so:

```javascript
import {createRef} from 'cherry-cola'

function Component() {
    const myRef = createRef()

    return <div ref={myRef}/>
}
```

**Returns:**

- `Ref` A new `Ref` instance.

### States

You can create states with [`createState()`](#createstateinitialvalue-any-state). In the function component this will
only return the state, which is an extended version of the respective object (Number, String, Array, etc.). Passing this
state into [`doSomething()`](#dosomethingcallback-args-any--void--function-dependencies-any) or
[`sideEffect()`](#sideeffectcallback-args-any--void) will convert this into an array in which the first entry in the
state object and the second entry is a function for changing the value of the state.

#### `createState(initialValue: any): State`

Create a state with the given value. Depending on the type of the value, a different state type will be returned. For
example, calling `createState()` with a number as the initial value will return a state object that is extended from
the `Number` builtin. This makes it easier to work with the state as a number. For instance, you can use the state in
math operations (`const incrementedValue = yourNumberState + 1`).

**Parameters:**

- `initialValue: any` The initial value for this state.

**Returns:**

- `State` A state object depending on the type of `initialValue`.

#### `Mutable` (Client-Side)

`Mutable` is used for client side state objects. It extends the wrappers for immutable values and overwrites
the `.valueOf()` method to always return the most current state value. The actual value of the immutable is – immutable,
and stays at an older version.  
Example of updating immutable type state:

```javascript
import {createState, doSomething} from 'cherry-cola'

function App() {
    const state = createState('oldValue')
    const button = createRef()

    doSomething(([state, setState], button) => {
        button.addEventListener('click', () => {
            setState('newValue')
            console.log(state) // Mutable {value: "newValue"}
            console.log(`New state: "${state}"`) // New state: "newValue"
        })
    }, [state, button])

    return (
        <button ref={button}/>
    )
}
```

### Location and Routing

### Essential built-in components

Cherry-cola provides some built-in components that are essential to a document.

#### `<Html>`

Renders a `<html>` element and manages the lang attribute (if you're building a multilingual app).

#### `<Head>`

Renders a `<head>` element and manages the loading of scripts and assets. It can also generate metadata for SEO and
icons automatically from your given configuration. You can pass your own elements which will just be rendered inside
the `<head>` and potentially replace the cherry-cola generated tags.  
For example:

```javascript
import {Html, Head, Body} from 'cherry-cola'

function App() {
    return (
        <Html>
            <Head>
                {/* title element overrides the default <title>Title</title> */}
                <title>My App</title>
            </Head>
        </Html>
    )
}
```

[//]: # (todo: show config and all features that are not implemented yet)

#### `<Body>`

Renders a `<body>` element.

### Islands
