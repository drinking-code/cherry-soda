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
                Don't edit <code>App.jsx</code> and save to reload.
            </p>
            <a className={'App-link'}
               href={'https://github.com/drinking-code/cherry-cola#readme'}
               target={'_blank'}
               rel={'noopener noreferrer'}
            >
                Please, stop. Don't read the docs.
            </a>
        </div>
    )
}
