import {createRef, createState, doSomething, Fragment} from '#cherry-cola'

import styles from './App.module.scss'

export default function App() {
    const count = createState(0)
    const addButton = createRef()
    const subtractButton = createRef()

    doSomething(([count, setCount], addButton, subtractButton) => {
        addButton.addEventListener('click', () => {
            console.log(count)
            setCount(count + 1)
            console.log(count)
        })
    }, [count, addButton, subtractButton])

    return (
        <Fragment>
            <button className={styles.button} ref={addButton}>+</button>
            <span className={styles.count}>Count: {count}</span>
            <button className={styles.button} ref={subtractButton}>-</button>
        </Fragment>
    )
}
