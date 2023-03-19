import {createRef, createState, doSomething} from '#cherry-cola'

import styles from './App.module.scss'

export default function App() {
    const count = createState(0)
    const addButton = createRef()
    const subtractButton = createRef()

    doSomething(([count, setCount], addButton, subtractButton) => {
        // console.log([count, setCount], addButton, subtractButton)
        const addClickHandler = () => setCount(count + 1)
        addButton.addEventListener('click', addClickHandler)
        const subtractClickHandler = () => setCount(Math.max(count - 1, 0))
        subtractButton.addEventListener('click', subtractClickHandler)

        return () => {
            addButton.removeEventListener('click', addClickHandler)
            subtractButton.removeEventListener('click', subtractClickHandler)
        }
    }, [count, addButton, subtractButton])

    return <>
        <button className={styles.button} ref={addButton}>+</button>
        <span className={styles.count}>Count: {count}</span>
        <button className={styles.button} ref={subtractButton}>-</button>
    </>
}
