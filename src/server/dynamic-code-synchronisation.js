import {WebSocketServer} from 'ws';

export default function dynamicCodeSynchronisation(server) {
    const wss = new WebSocketServer({server, path: "/__cherry-cola_dcs"});
    wss.on('connection', function connection(ws) {
        ws.on('message', function message(data) {
            console.log('received: %s', data);
        });

        ws.send('something');
    })
}
