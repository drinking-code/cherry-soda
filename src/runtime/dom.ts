import {ElementId} from '../jsx/VirtualElement'

declare const refs: { [refId: string]: ElementId['fullPath'][] }

export function findNode(refId: string) {
    console.log(refs[refId])
}
