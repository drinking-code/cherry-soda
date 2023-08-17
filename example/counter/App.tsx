import {render} from '#cherry-soda'

import styles from './App.module.scss'

const state = (initialValue: any, methods: Record<string, Function>): typeof methods => methods

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

    // tree.get('@add-button').on.click(count.increase)
    // tree.get('@subtract-button').on.click(count.decrease)

    render(tree)
}
