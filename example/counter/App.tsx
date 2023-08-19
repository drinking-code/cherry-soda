import {render, state} from '#cherry-soda'

import styles from './App.module.scss'

export default function App() {
    const count = state(0, {
        increase: value => ++value,
        decrease: value => Math.max(--value, 0)
    })

    const tree = <>
        <button className={styles.button} ref={'subtract-button'}>&minus;</button>
        <span className={styles.count}>Count: {count}</span>
        <button className={styles.button} ref={'add-button'}>&#43;</button>
    </>

    tree.getByRef('add-button').on.click(count.increase)
    tree.getByRef('subtract-button').on.click(count.decrease)

    render(tree)
}
