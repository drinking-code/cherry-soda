const ws = new WebSocket(location.origin.replace(/^http/, 'ws') + '/__cherry-cola_dcs')

ws.addEventListener('message', e => {
    applyChange(JSON.parse(e))
})

function applyChange() {

}
