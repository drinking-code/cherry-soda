import {isObject} from './object'
import {isArray} from './array'
import {mapObject} from './iterate-object'

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
