import {Fragment} from '../../src/'

export default function App() {
    /*const count = createState()
    const addButton = createRef()
    const subtractButton = createRef()

    doSomething(([count, setCount]) => {

    }, [count])*/

    return (
        <Fragment>
            <button>+</button>
            <span>0</span>
            <button>-</button>
        </Fragment>
    )
}
