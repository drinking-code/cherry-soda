import {filterObject, mapObject} from '../../utils/iterate-object'

export function checkProps(props: { [propName: string]: any }) { // todo
    const mapped = mapObject(props, ([propName, propValue]) => {
        if (propName === 'className')
            propName = 'class'
        return [propName.toLowerCase(), propValue]
    })
    const transformed = mapObject(mapped, ([propName, propValue]) => {
        if (['class', 'id'].includes(propName) && Array.isArray(propValue))
            propValue = propValue.filter(v => v).join(' ')
        return [propName.toLowerCase(), propValue]
    })
    return filterObject(transformed, ([propName]) => {
        return !['ref'].includes(propName)
    })
}
