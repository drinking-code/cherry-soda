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

Yet another JavaScript framework that nobody needs. Instead of re-rendering whole components after state value changes,
it updates only affected spots in the DOM.  
The plan is to create an SSR-mode that shifts HTML rendering to the server completely. This means that only JavaScript,
that does not render HTML will be bundled and send to / executed on the client.

> [!WARNING]
> Cherry-soda is experimental. Everything is subject to change.

## Test the waters, dip a toe

If you just to test out cherry-soda, you can run the examples. For that you need to have [Node](https://nodejs.org)
installed. Then, clone the repository, go to `/example`, and install the dependencies with `npm i` there. Start an
example like this:

```shell
npm run start ./cherry-soda-template
```

## Get started

[//]: # (todo: add command to add boilerplate code)

In a new Node project install cherry-soda with `npm i cherry-soda`, and add files `src/index.js` and `src/App.js`:

```javascript
// src/index.js
import {mount} from 'cherry-soda'
import App from './App'

mount(<App />, document.querySelector('#app'))
```

if you use webpack HMR, append

```javascript
if (module.hot) {
    module.hot.accept();
}
```

```javascript
// src/App.js
import {defineDom} from 'cherry-soda'

export default function App() {
    defineDom(<h1>Hello world!</h1>)
}
```

`index.js` is the main entry point. The `mount()` function renders the given JSX element to the given DOM element. Each
component can render a JSX element to the DOM itself by calling `defineDom()`.

[//]: # (todo: add this cli usable dev server to code)

Use webpack (or a bundler of your choice) with a configuration like this:

```javascript
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

module.exports = {
    entry: 'path/to/src/index.js',
    output: {
        filename: 'bundle.js',
        path: 'path/to/dist/',
        publicPath: '/'
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/env'],
                    plugins: [['@babel/plugin-transform-react-jsx', {
                        runtime: 'automatic',
                        importSource: 'cherry-soda'
                    }]]
                }
            }
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(mode)
        }),
        new HtmlWebpackPlugin({
            templateContent: '<div id="app"></div>'
        })
    ]
}
```

Of course, add SCSS, Less, TypeScript, etc. according to taste.  
Notice the [HtmlWebpackPlugin](https://webpack.js.org/plugins/html-webpack-plugin/): You'll need an HTML file that
imports the bundled script and has a mounting point (in this case a `<div>`) with `id="app"`. Make sure bundle is
executed after the document is loaded, or adjust your `src/index.js` so that `mount()` is called after document load.

## Guides

[//]: # (### State management)

[//]: # (### Route on the server, and the client will route, too)

[//]: # (### Section your app with `<Island>`s)

## Reference

### JSX Elements

### States

You can create states with [`state()`](#createstate). This will return a `State` object that holds a value. During
rendering states are automatically converted into their respective values. They can also drive dynamic values

<h4 id="createstate">
  <code>state&lt;V>(initialValue: V, methods?: StateMethods&lt;V>, updater?: UpdaterInitializer): State&lt;V></code>
</h4>

> Where
> ```
> StateMethods<V> = { 
>   [method: string]: (currentValue: V, ...rest: any[]) => V
> }
> ```
> and
> ```
> UpdaterInitializer = (update: (newValue: V) => void) => void
> ```

Creates a `State` object with the given value.

The `methods` parameter allows you to define methods to update the state value besides calling `.update()`. For example,
you might want to create a toggle:

```javascript
// normal state update
const isPlaying = state(false)

button.on.click(() => {
    isPlaying.update(!isPlaying.valueOf())
})

// with method
const isPlaying = state(false, {
    toggle: (currentValue) => !currentValue
})

button.on.click(isPlaying.toggle)
```

To have a state being updated, you can set an updater with the `updater` parameter. The updater has to be a function,
which gets an `update()` function passed to it. For example, you might want to tie a state value to an element's
dimensions:

```javascript
const elementDimensions = state(myElement.getBoundingClientRect(), {}, update => {
    const resizeObserver = new ResizeObserver((entries) => {
        update(entries[0].contentRect)
    })
    resizeObserver.observe(myElement)
})
```

**Parameters:**

- `initialValue: any` – The initial value for this state.
- `methods?: StateMethods` – Functions that can be called on this state to update it.
- `updater?: Function` – Function for setting up updaters.

**Returns:**

- `State` – A `State` object with `initialValue` as its value, and `methods` as methods.

#### `State`

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

