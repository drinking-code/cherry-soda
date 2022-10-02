import {createRef, createState, doSomething, Fragment} from '#cherry-cola'

import styles from './App.module.scss'

export default function App() {
    const count = createState(0)
    // console.log(count)
    const addButton = createRef()
    const subtractButton = createRef()

    doSomething((/*[count, setCount], */addButton, subtractButton) => {
        // console.log('count: ', count)
        // console.log('setCount: ', setCount)
        console.log('addButton', addButton)
        console.log('subtractButton', subtractButton)
    }, [/*count, */addButton, subtractButton])

    return (
        <Fragment>
            <button className={styles.button} ref={addButton}>+</button>
            <span className={styles.count}>Count: {count}</span>
            <button className={styles.button} ref={subtractButton}>-</button>
        </Fragment>
    )
}
