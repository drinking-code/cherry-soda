import {createState, Fragment} from '../../src/'

import styles from './App.module.scss'

export default function App() {
    const count = createState(0)
    // const addButton = createRef()
    // const subtractButton = createRef()

    /*doSomething(([count, setCount]) => {

    }, [count])*/

    return (
        <Fragment>
            <button className={styles.button}>+</button>
            <span className={styles.count}>{count}</span>
            <button className={styles.button}>-</button>
        </Fragment>
    )
}
