import {numberToAlphabetic} from './number-to-string'

export default function generateClassName(className, fileName) {
    if (className.startsWith('_')) return className
    const isGlobal = className.startsWith('global_')
    if (!fileName || isGlobal) fileName = ''
    if (isGlobal) className = className.replace(/^global_/, '')
    const prefix = isGlobal ? '_' : ''

    let hash = Bun.hash(fileName) as number
    if (process.env.NODE_ENV !== 'production')
        return prefix + className + '_' + numberToAlphabetic(hash).substring(0, 8)

    hash = Bun.hash(fileName + className) as number
    return prefix + numberToAlphabetic(hash).substring(0, isGlobal ? 2 : 4)
}
