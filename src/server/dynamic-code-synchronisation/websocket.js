import {WebSocketServer} from 'ws'

export const eventName = 'dev-update'

export default function dynamicCodeSynchronisation(server) {
    const wss = new WebSocketServer({server, path: "/__cherry-cola_dcs"});
    wss.on('connection', ws => {
        global['cherry-cola'].eventTarget.addEventListener(eventName, event => {
            ws.send(JSON.stringify(event.detail))
        })
    })
}
