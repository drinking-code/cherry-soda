import type VNode from './VNode'
import {DOMEventHandler, type DOMEvents} from './types/event-handler-attr'

interface Listener<Event extends DOMEvents, Target extends EventTarget> {
    id: number,
    type: Event,
    handler: DOMEventHandler<Event, Target>,
    options: boolean | AddEventListenerOptions,
}

type MappedActivators<Target extends EventTarget> = {
    [Event in DOMEvents]: (handler: DOMEventHandler<Event, Target>, options?: boolean | AddEventListenerOptions) => any
}

const dingus = {}

export default class Listeners {
    private readonly _node: VNode
    private _queue: Listener<DOMEvents, EventTarget>[]
    private _activatedListeners: Listener<DOMEvents, EventTarget>[]

    constructor(forNode: VNode) {
        this._node = forNode
        this._queue = []
        this._activatedListeners = []
    }

    private _newId() {
        return this._activatedListeners.length + this._queue.length
    }

    getActivators(): MappedActivators<typeof this._node._dom> {
        const thisRef = this
        return new Proxy(dingus, {
            get(target: null, key: DOMEvents | any): any {
                return (handler: DOMEventHandler<typeof key, typeof this._node._dom>, options?: boolean | AddEventListenerOptions) => {
                    const listener: Listener<typeof key, typeof this._node._dom> = {
                        id: thisRef._newId(),
                        type: key,
                        handler,
                        options
                    }
                    if (thisRef._node._dom) {
                        thisRef._node._dom
                            .addEventListener(listener.type as keyof HTMLElementEventMap, listener.handler, listener.options)
                        thisRef._activatedListeners.push(listener)
                    } else {
                        thisRef._queue.push(listener)
                    }
                    return listener.id
                }
            }
        }) as MappedActivators<typeof this._node._dom>
    }

    activateQueued() {
        if (!this._node._dom) throw new Error('No DOM element for VNode. This a problem with cherry-soda.')
        const activatedListenersIndices: number[] = []
        this._queue.forEach((listener, index) => {
            this._node._dom
                .addEventListener(listener.type as keyof HTMLElementEventMap, listener.handler, listener.options)
            activatedListenersIndices.push(index)
        })
        activatedListenersIndices.reverse()
        activatedListenersIndices.forEach((index) => {
            this._activatedListeners.push(this._queue.splice(index, 1)[0])
        })
    }
}
