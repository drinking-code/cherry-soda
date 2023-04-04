import {filterObject, mapObject} from '../../utils/iterate-object'
import {isStateUsage} from '../../state/state-usage'
import {isState} from '../../state/state'
import {stringifyDomTokenList, stringifyStyleObject} from '../../runtime/state-usage'

export function checkProps(props: { [propName: string]: any }) { // todo
    const mapped = mapObject(props, ([propName, propValue]) => {
        if (propName === 'className')
            propName = 'class'
        return [propName.toLowerCase(), propValue]
    })
    const transformed = transformProps(mapped)
    return filterObject(transformed, ([propName]) => {
        return !['ref'].includes(propName)
    })
}

export function transformProps(props: { [propName: string]: any }) {
    return mapObject(props, ([propName, propValue]) => {
        if (isState(propValue))
            propValue = propValue.use()
        if (!isStateUsage(propValue)) {
            if (['class', 'id'].includes(propName) && Array.isArray(propValue))
                propValue = stringifyDomTokenList(propValue)
            if (propName === 'style' && typeof propValue === 'object')
                propValue = stringifyStyleObject(propValue)
        }
        return [propName.toLowerCase(), propValue]
    })
}
