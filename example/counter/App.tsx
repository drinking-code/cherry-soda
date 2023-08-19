import {render} from '#cherry-soda'

import styles from './App.module.scss'

const state = (initialValue: any, methods: Record<string, Function>): {
    [key in keyof typeof methods]: () => void
} => Object.fromEntries(Object.entries(methods).map(([key]) => [key, () => 0]))

export default function App() {
    const count = state(0, {
        increase: value => value++,
        decrease: value => Math.max(value--, 0)
    })

    const tree = <>
        <button className={styles.button} ref={'subtract-button'}>-</button>
        <span className={styles.count}>Count: {count}</span>
        <button className={styles.button} ref={'add-button'}>+</button>
    </>

    tree.getByRef('add-button').on.click(count.increase)
    tree.getByRef('subtract-button').on.click(count.decrease)

    render(tree)
}
