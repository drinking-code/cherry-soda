import {type HashType} from '../jsx/VirtualElement'
import {type State} from './client-state'
import {findElementByPath} from './dom'
import {type ContextType} from '../compiler/template/state-usage'
import {type StringifiableType} from '../utils/stringify'

export type ClientContextType<T extends 'child' | 'prop'> = ContextType<T> & { makeString: (value: string) => string }

declare const stateUsages: Map<HashType, (...values: any[]) => string>
declare const stateStateUsagesMap: { [key: HashType]: HashType[] }
declare const stateUsagesParameters: Map<HashType, State[]>
declare const stateUsagesContexts: Map<HashType, ClientContextType<any>[]>

export function stringifyStyleObject(object: { [p: string]: StringifiableType }) {
    return Object.entries(object)
        .filter(([name, value]) => value && value !== 0)
        .map(([name, value]) => `${name}:${value}`)
        .join(';')
}

export function stringifyDomTokenList(array: StringifiableType[]) {
    return array.filter(v => v).join(' ').trim()
}

export function updateStateUsages(id: HashType) {
    stateStateUsagesMap[id]?.forEach(stateUsageId => {
        const contexts = stateUsagesContexts.get(stateUsageId)
        contexts.forEach(context => {
            let transform
            if (stateUsages.has(stateUsageId)) {
                transform = stateUsages.get(stateUsageId)
                transform = stateUsages.get(stateUsageId)
            } else {
                transform = value => value
            }
            const transformParameters = stateUsagesParameters.get(stateUsageId)
            const target = findElementByPath(context.contextElement)
            const transformed = transform(
                ...transformParameters.map(state => state.valueOf())
            )
            if (context.type === 'child') {
                const newString = context.makeString(String(transformed))
                if (target.childElementCount == 0) {
                    target.innerText = newString
                } else {
                    target.children[context.beforeChild].previousSibling.replaceWith(
                        document.createTextNode(newString)
                    )
                }
            } else if (context.type === 'prop') {
                let newString
                if (context.prop === 'style' && typeof transformed === 'object') {
                    newString = stringifyStyleObject(transformed)
                } else if (['class', 'id'].includes(context.prop) && Array.isArray(transformed)) {
                    newString = stringifyDomTokenList(transformed)
                } else {
                    newString = String(transformed)
                }
                target.setAttribute(context.prop, newString)
            }
        })
    })
}
