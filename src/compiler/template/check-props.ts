import {filterObject, mapObject} from '../../utils/iterate-object'

export function checkProps(props: { [propName: string]: any }) { // todo
    const mapped = mapObject(props, ([propName, propValue]) => {
        if (propName === 'className')
            propName = 'class'
        return [propName.toLowerCase(), propValue]
    })
    return filterObject(mapped, ([propName]) => {
        return !['ref'].includes(propName)
    })
}
