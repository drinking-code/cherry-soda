import {findElement} from './find-element.js'

// checks for origin which might not exist in a test environment
const ws = location.origin && location.origin !== 'null'
    ? new WebSocket(location.origin.replace(/^http/, 'ws') + '/__cherry-cola_dcs')
    : undefined

ws?.addEventListener('message', event => {
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
