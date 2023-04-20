import {numberToAlphabetic} from './number-to-string'

export default function generateClassName(className, fileName) {
    if (className.startsWith('_')) return className

    if (process.env.NODE_ENV !== 'production') {
        const hash = Bun.hash(fileName) as number
        return className + '_' + numberToAlphabetic(hash, 8)
    } else {
        const hash = Bun.hash(fileName + className) as number
        return numberToAlphabetic(hash, 4)
    }
}
