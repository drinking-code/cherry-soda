<div align="center">
    <img width="300" height="300" src="https://cdn.jsdelivr.net/gh/drinking-code/cherry-soda@v0.1.0-experimental/img/logo.svg" alt="cherry-soda">
</div>
<div align="center">
    <a href="#get-started">Get started</a>
    <!--&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
    <a href="#guides">Guides</a>-->
    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
    <a href="#reference">Reference</a>
</div>

---

Yet another JavaScript framework that nobody needs. Instead of re-rendering whole components after state value changes,
it updates only areas in the DOM defined by the developer as affected by state changes.  
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

[//]: # (## Guides)

[//]: # (### State management)

[//]: # (### Section your app with `<Island>`s)

## Reference

### JSX Elements

Cherry-soda exports [`createElement()`](#createelement) which allows you to create virtual elements, that form a
template for rendering the actual DOM later on. `createElement()` is exported as `jsx` in `jsx-runtime.ts`, so you can
call it by using JSX:

```jsx
// this
import {createElement} from 'cherry-soda'

const myDivElement = createElement('div')

// is the same as 
const myDivElement = <div />
```

<h4 id="createelement">
  <code>createElement(type: VNodeType, props: Record&lt;string, any>): VNode</code>
</h4>

> Where
> ```
> VNodeType = 
>     | (props: Record<string, any>) => void
>     | typeof Fragment
>     | string
> ```

Creates a cherry-soda element.

**Parameters:**

- `type: VNodeType` – Either the tag name of a DOM element, the `Fragment` symbol, or a function (that may or may not
  call [`defineDom()`](#definedom)).
- `Record<string, any>` – Either attributes for a DOM element, or properties passed to the function passed as `type`.

**Returns:**

- `VNode` – A `VNode` with the given `type` & `props`.

<h4 id="definedom">
  <code>defineDom(node: JSX.Element): JSX.Element</code>
</h4>

> This function should only be called in a function component, and should at most be called once per function component, otherwise might break things.

Defines the JSX element `node` for the current function component. Converts internally to DOM elements and renders to DOM appropriately.

**Parameters:**

- `node: JSX.Element` – JSX element to be defined for the function component.

**Returns:**

- `JSX.Element` – The node that was passed as `node`.

<h4 id="mount">
  <code>mount&lt;V>(node: JSX.Element, to: HTMLElement): void</code>
</h4>

Defines the JSX element `node` for the given DOM element `to`. Converts internally to DOM elements and renders to the DOM element appropriately.

**Parameters:**

- `node: JSX.Element` – JSX element to be defined for the given DOM element.
- `to: HTMLElement` – DOM element to which elements should be rendered.

[//]: # (<h4 id="hydrate">)
[//]: # (  <code>hydrate&lt;V>&#40;node: JSX.Element, to: HTMLElement&#41;: void</code>)
[//]: # (</h4>)

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

The `State` object holds the initial value of the state and can be used in the DOM like a value:

```javascript
import {defineDom, state} from 'cherry-soda'

function Component() {
    const myState = state('foo')

    defineDom(
        <div id={myState}>
            {myState}
        </div>
    )
}
```

Sometimes, you might not want to use the states value directly, but a transformed version of it. To do that, call
the `.use()` method. It takes a callback to which the state value is passed as a parameter:

```javascript
import {defineDom, state} from 'cherry-soda'

function Component() {
    const elementType = state('a')
    const label = 'foo'

    defineDom(<>
        {elementType.use(tagName => {
            if (tagName === 'a')
                return <a>{label}</a>
            else
                return <span>{label}</span>
        })}
    </>)
}
```

You can also process multiple states in one `.use()` by concatenating them with `.and()`. The state's values are passed
in the order they were concatenated in:

```javascript
import {defineDom, state} from 'cherry-soda'

function Component() {
    const revenue = state(5)
    const expenses = state(3)

    defineDom(<>
        Profit: {revenue.and(expenses).use((rev, exp) => rev - exp)}
    </>)
}
```

> Tip: using `myState` in JSX is the same as `myState.use()` is the same as `myState.use(value => value)`
