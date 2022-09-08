import {eventName} from './websocket.js'

if (!global['cherry-cola'])
    global['cherry-cola'] = {}
if (!global['cherry-cola'].eventTarget)
    global['cherry-cola'].eventTarget = new EventTarget()

export function reportNewDom() {

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
    global['cherry-cola'].eventTarget.dispatchEvent(event)
}
