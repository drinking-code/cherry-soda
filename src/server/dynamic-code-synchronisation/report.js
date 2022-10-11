import {eventName} from './websocket.js'
import {default as iposPromise} from '../../ipos.ts'

const ipos = await iposPromise

if (!ipos.eventTarget)
    ipos.create('eventTarget', new EventTarget())

export function reportNewDom(data) {
    let event = new CustomEvent(eventName, {
        detail: {
            type: 'dom',
            data
        }
    })
    ipos.eventTarget.dispatchEvent(event)
}

export function reportNewScripts() {

}

export function reportNewAsset(data) {
    const message = data.map(asset => '/' + asset)
    let event = new CustomEvent(eventName, {
        detail: {
            type: 'asset',
            data: message
        }
    })
    // todo: just send new rules from css instead of the whole file
    ipos.eventTarget.dispatchEvent(event)
}
