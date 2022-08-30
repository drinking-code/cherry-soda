import {render} from '../../src'

import './index.css';
import App from './App'

function Document() {
    return <html lang={'en'}>
    <head>
        <title>cherry-cola</title>
        <link rel={'stylesheet'} href={'/style.css'}/>
    </head>
    <body>
    <App/>
    </body>
    </html>
}

export default function () {
    return render(<Document/>)
}

