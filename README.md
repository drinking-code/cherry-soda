<div align="center">
    <img width="300" height="300" src="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda@v0.1.0-experimental/img/logo.svg" alt="cherry-soda">
</div>
<div align="center">
    <a href="#get-started">Get started</a>
    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
    <a href="#guides">Guides</a>
    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
    <a href="#reference">Reference</a>
</div>

---

Yet another JavaScript framework that nobody needs. It has an SSR-first approach, and uses stateful, functional JSX
components to build apps. The components are rendered on the server, but contain state change handlers that are executed
in the browser. Instead of bundling the full component, cherry-soda extracts and bundles only the necessary code (the
event handler with its lexical scope, a template for client-side rendering, and styles) which can drastically reduce
bundle size. Therefore, by default (i.e. without using state change handlers), there is no client side JavaScript
whatsoever.  
Currently, cherry-soda only runs on bun, Node compatibility is planned.

> **Warning**&nbsp;&nbsp;
> Cherry-soda is experimental. Everything is subject to change.

## Test the waters, dip a toe

If you just to test out cherry-soda, you can run the examples. For that you need to have [Bun](https://bun.sh)
installed. Then, clone the repository, install the dependencies with `bun i`. Use cherry-soda's CLI to run an example:

```shell
cli/index dev example/cherry-soda-template/index.jsx
```

[//]: # (Visit `localhost:3000` and / or edit files in `example/cherry-soda-template/`. To test out the other examples, use the
respective `index.jsx` as an argument instead.)

## Get started

[//]: # (todo: add command to add boilerplate code)

In a new Bun project install cherry-soda with `bun i cherry-soda`, and add files `src/index.js` and `src/App.js`:

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

`index.js` is the main entry point for cherry-soda. It will look for an exported function `main()` and will
use the returned value to render HTML. `App.js` is an example component.

Then, add the cherry-soda JSX runtime to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "cherry-soda"
  }
}
```

Run `cherry-soda dev src/index.js` to start the dev server. Then, visit `localhost:3000`.

Alternatively, you can use the [`cherrySoda()`](#cherrysoda) function in your own server to render the app. This also
automatically serves the asset files (JavaScript, CSS, images, etc.).  
For Bun.serve:

```javascript
// main.js
import cherrySoda from 'cherry-soda'

const cherrySodaApp = cherrySoda('src/index.js')

Bun.serve({
    async fetch(req) {
        const url = new URL(req.url)
        if (url.pathname.startsWith('/api'))
            return new Response() // your custom responses
        return await cherrySodaApp(req)
    },
    port: 3000,
})
```

[//]: # (### Dev server &#40;HMR-like&#41;)

[//]: # (Cherry-soda doesn't use webpack, so HMR isn't really an option. However, cherry-soda provides a feature &#40;preliminarily
called dynamic code synchronisation&#41; that reflects changes made to your code in the browser immediately after saving.
The `cherry-soda dev` command has this activated out of the box.  
For usage with a custom server use the `dynamicCodeSynchronisation&#40;&#41;` function.)

[//]: # (todo: example)

## Guides

### Add client-side code

In a function component typically all code is executed on the server. To execute code on the client you can use
the [`doSomething()`](#dosomething) function. The callback provided will only be executed on the client. You can provide
states and/or refs to listen to in an array as the second parameter. If given, the callback will be called every time a
state or ref changes. To clean up, the callback may return a function, which will be called before the callback is
called immediately before a state change.

[//]: # (todo: ref changing ??? wtf)
To refer to an element that the component returns you can use a ref with [`createRef()`](#createref), which you will
also need to pass in the array.
Inside [`doSomething()`](#dosomething) a ref will be the actual node of the DOM. States can also be passed in the
dependency array. A state will be passed to the function as an array of the state value and a function to change the
state.  
Here is an [example](/example/counter/App.jsx) to illustrate all those features:

```javascript
import {createRef, createState, doSomething} from 'cherry-soda'

export default function Counter() {
    // create a state with an initial value `0`
    /* the returned value is an "State" object that can be used 
     * as a child, prop value, as is or with ".use()"
     */
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
         * and not refs anymore.
         */
        addButton.addEventListener('click', () => {
            setCount(count + 1)
        })
        subtractButton.addEventListener('click', () => {
            setCount(Math.max(count - 1, 0))
        })
    }, [count, addButton, subtractButton])

    return <>
        {/* The ref object must be passed here as prop "ref" to assign this node */}
        <button ref={addButton}>+</button>
        {/* The state object can be used here just like that. 
        It'll be converted to a number (or rather a string) internally. */}
        <span>Count: {count}</span>
        <button ref={subtractButton}>-</button>
    </>
}
```

### Route on the server, and the client will route, too

### Section you app with `<Island>`s

## Reference

### Rendering and function components

#### Rendering

<h5 id="cherrysoda">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda/img/cherry-soda-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda/img/cherry-soda-light.svg">
    <img alt="cherrySoda(entry: string)" width="262.5" src="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda/img/cherry-soda-light.svg">
  </picture>
</h5>

To render an app, you can use the `cherrySoda()` function. It returns a request handler for `Bun.serve()` and handles
compiling / building and watching all the files belonging to your app.

**Parameters:**

- `entry: string` Absolute path to the [entry file](#entry-file)

**Returns:**

- `(req: Request) => Response`

[//]: # (todo: document the element children find method)

#### Entry file

Every cherry-soda app has a single entry file. This file exports a function `main()`, which returns the main function
component (usually called `<App/>`). If this component does not yield a `<html>` tag, cherry-soda will automatically
wrap the resulting HTML in a standard document.

[//]: # (todo: create option to turn that off)

#### Function components

Apps are built with stateful function components. Each component is a function that accept props as a parameter and
return JSX element/s. All code in a function component gets executed on the server.  
Internally, function components are called once on startup in production mode, and immediately after they are changed in
development mode. This can cause unexpected effects for example when a function component writes to a database. This is
why you should use [`sideEffect()`](#sideeffect) any non-deterministic server-side code.    
If you want to execute code for a component in the browser, use
[`doSomething()`](#dosomething).
Cherry-soda collects the code given as the callback to `doSomething()` at build time and bundles it into a single file
together with code from other `doSomething()`s and cherry-soda's runtime.

<h5 id="sideeffect">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda/img/side-effect-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda/img/side-effect-light.svg">
    <img alt="sideEffect(callback: (...args: any[]) => void)" width="437.5" src="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda/img/side-effect-light.svg">
  </picture>
</h5>

<h5 id="dosomething">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda/img/do-something-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda/img/do-something-light.svg">
    <img alt="doSomething(callback: (...args: ([any, (value: any) => void] | HTMLElement))[]) => void | Function, recallOn: (State | Ref)[])" width="586.25" src="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda/img/do-something-light.svg">
  </picture>
</h5>

This function lets you execute code in the browser. The function `callback` and its lexical scope get extracted by
cherry-soda's compiler and bundled into the frontend JavaScript. All [refs](#refs) and [states](#states) that are used
in the `callback` should be passed in the `recallOn` array.  
The values you passed in the array will be passed in the same order into the `callback` function on the client. If a ref
is passed into the array, the passed value for the function will be the matching HTML element. If a state is passed into
the array, the passed value for the function will be an array with the value as the first entry and a function for
changing the value as the second entry.  
The callback function may return another function. This (returned) function will be called before a state changes
value (after calling the function to change the state value). You can use this function to clean up if you need to.

**Parameters:**

- `callback: (...args: any[]) => void | Function` A function with the code that you want to execute on the client. The
  function may return another function. The returned function will be called anytime the component's elements are
  removed from the DOM.
- `recallOn: (State | Ref)[]` An array with all dependencies for the callback function

### Refs

Refs are a way to work with the DOM nodes that your function components return. To use, get a reference instance by
calling the [`createRef()`](#createref) function, and pass it to the desired element with the `ref` parameter. When you
pass the ref object in the `recallOn` array of [`doSomething()`](#dosomething) cherry-soda will pass the actual DOM
element to the callback on the client. You can also pass one ref to multiple elements.
If you do that, cherry-soda will pass a `HTMLCollection` containing the respective DOM elements inside
the [`doSomething()`](#dosomething) callback.

<h4 id="createref">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda/img/create-ref-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda/img/create-ref-light.svg">
    <img alt="createRef(): Ref" width="175" src="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda/img/create-ref-light.svg">
  </picture>
</h4>

Returns a new `Ref`. Pass this to an element like so:

```javascript
import {createRef} from 'cherry-soda'

function Component() {
    const myRef = createRef()

    return <div ref={myRef}/>
}
```

**Returns:**

- `Ref` A new `Ref` instance.

### States

You can create states with [`createState()`](#createstate). This will return a `State` object that holds a value.
Passing this state into [`doSomething()`](#dosomething) or [`sideEffect()`](#sideeffect) will convert it into an array
in which the first entry in the state object and the second entry is a function for changing the value of the state.

<h4 id="createstate">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda/img/create-state-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda/img/create-state-light.svg">
    <img alt="createState(initialValue: any): State" width="367.5" src="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda/img/create-state-light.svg">
  </picture>
</h4>

Creates a `State` object with the given value.

**Parameters:**

- `initialValue: any` The initial value for this state.

**Returns:**

- `State` A `State` object with `initialValue` as its value.

#### `State` (Server-Side)

The `State` object holds the initial value of the state and can be passed into [`doSomething()`](#dosomething)
or [`sideEffect()`](#sideeffect) or used in the DOM by using it like a value:

```javascript
import {createState} from 'cherry-soda'

function Component() {
    const myState = createState('foo')

    return <div id={myState}>
        {myState}
    </div>
}
```

Sometimes, you don't want to use the states value directly, but a transformed version of it. To do that, use
the `.use()` method. It takes a callback which itself receives the state value as a parameter:

```javascript
import {createState} from 'cherry-soda'

function Component() {
    const elementType = createState('a')
    const label = 'foo'

    return <>
        {elementType.use(tagName => {
            if (tagName === 'a')
                return <a>{label}</a>
            else
                return <span>{label}</span>
        })}
    </>
}
```

You can also use multiple states in one `.use()` by concatenating them with `.and()`. The state's values are passed in
the order they were concatenated in:

```javascript
import {createState} from 'cherry-soda'

function Component() {
    const revenue = createState(5)
    const expenses = createState(3)

    return <>
        Profit: {revenue.and(expenses).use((a, b) => a - b)}
    </>
}
```

> Fun fact: using `myState` is the same as `myState.use()` is the same as `myState.use(value => value)`

### Location and Routing

### Essential built-in components

Cherry-soda provides some built-in components that help you manage the basic document structure.

#### `<Html>`

Renders a `<html>` element and manages the lang attribute (if you're building a multilingual app).

#### `<Head>`

Renders a `<head>` element and manages the loading of scripts and assets. It can also automatically generate metadata
for SEO, and icons from your given configuration. You can pass your own elements into `<Head>`. These will just be
rendered inside the `<head>` and replace the generated elements if any.  
For example:

```javascript
import {Html, Head, Body} from 'cherry-soda'

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
