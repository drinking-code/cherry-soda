import {isObject} from './object'
import {isArray} from './array'
import {mapObject, mapObjectToArray} from './iterate-object'
import {isState} from '../state/state'
import {isStateUsage} from '../state/state-usage'
import {includeStateUsage} from '../compiler/template/state-usage'
import {type VirtualElementInterface} from '../jsx/cherry-soda'
import {type VirtualElement} from '../jsx/VirtualElement'

interface HasToStringInterface {
    toString: () => string
}

type StringifiableVariety = { [p: string]: StringifiableType } | StringifiableType[]
export type StringifiableType = StringifiableVariety | string | number | boolean | null | HasToStringInterface

export default function stringifyValue(value: StringifiableType): string {
    if (isArray(value))
        return JSON.stringify(value.map(stringifyValue))
    else if (isObject(value))
        return JSON.stringify(mapObject(value, ([key, value]) => [key, stringifyValue(value)]))
    else if (value === undefined)
        return typeof undefined
    else
        return value.toString()
}

export function stringifyProps(props: { [p: string]: any }, contextElement?: VirtualElementInterface<any>) {
    return mapObjectToArray(props, ([key, value]) => {
        if (isState(value) || isStateUsage(value)) {
            const stateUsage = !isStateUsage(value) ? value.use() : value
            includeStateUsage(stateUsage, {
                type: 'prop',
                contextElement: contextElement as VirtualElement,
                prop: key
            })
            return '#' + stateUsage.$$stateId.serialize() // todo
        } else {
            return key + JSON.stringify(stringifyValue(value))
        }
    })
}
