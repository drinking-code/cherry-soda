import logo from './logo.svg'
import logoLettering from './logo-lettering.svg'
import './App.css'

export default function App() {
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
               href={'https://github.com/drinking-code/cherry-soda#readme'}
               target={'_blank'}
               rel={'noopener noreferrer'}
            >
                Read the docs.
            </a>
        </div>
    )
}
