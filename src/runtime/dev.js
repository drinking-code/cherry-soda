import {findElement} from './find-element.js'

const ws = new WebSocket(location.origin.replace(/^http/, 'ws') + '/__cherry-cola_dcs')

ws.addEventListener('message', event => {
    applyChange(JSON.parse(event.data))
})

function applyChange(message) {
    if (message.type === 'dom')
        message.data.forEach(changeElement)
}

function changeElement(data) {
    console.log(data)
    const element = findElement(data.elementId)
    console.log(element)
    if (data.property === 'text') {
        element.innerText = data.newValue.join('')
    }
}
