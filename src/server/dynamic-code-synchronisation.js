import {WebSocketServer} from 'ws';

export default function dynamicCodeSynchronisation(server) {
    const wss = new WebSocketServer({server, path: "/__cherry-cola_dcs"});
    wss.on('connection', ws => {
        ws.send('something')
    })
}

export function reportNewDom() {

}

export function reportNewScripts() {

}

export function reportNewAsset() {

}
