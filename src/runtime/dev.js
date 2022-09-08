const ws = new WebSocket(location.origin.replace(/^http/, 'ws') + '/__cherry-cola_dcs')

ws.addEventListener('message', event => {
    applyChange(JSON.parse(event.data))
})

function applyChange(message) {
    console.log(message)
}
