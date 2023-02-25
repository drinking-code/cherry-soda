import logo from './logo.svg'
import logoLettering from './logo-lettering.svg'
import './App.css'
import {doSomething} from '#cherry-cola'

// const c = [doSomething]
/*const c = []
c.push(doSomething)*/
/*const c = {}
c.d = doSomething*/
const c = {d: doSomething}
// const c = doSomething

export default function App() {
    c/*[0]*/.d(() => {

    })
    return (
        <div className={'App'}>
            <div className={'App-logo'}>
                <img src={logo} className={'App-logo-animated'} alt={'logo'}/>
                <img src={logoLettering} alt={'logo-lettering'}/>
            </div>
            <p>
                Edit <code>App.jsx</code> and save to reload.
            </p>
            <a className={'App-link'}
               href={'https://github.com/drinking-code/cherry-cola#readme'}
               target={'_blank'}
               rel={'noopener noreferrer'}
            >
                Read the docs.
            </a>
        </div>
    )
}
