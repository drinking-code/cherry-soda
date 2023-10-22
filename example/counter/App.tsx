import {defineDom, state} from 'cherry-soda'

import styles from './App.module.scss'

export default function App() {
    const count = state(0, {
        increase: value => ++value,
        decrease: value => Math.max(--value, 0)
    })

    const subtractButton = <button className={styles.button}>&minus;</button>
    subtractButton.on.click(count.decrease)

    const addButton = <button className={styles.button}>&#43;</button>
    addButton.on.click(count.increase)

    defineDom(
        <>
            {subtractButton}
            <span className={styles.count}>Count: {count}</span>
            {addButton}
        </>
    )
}
