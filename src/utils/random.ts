import {numberToAlphanumeric} from './numberToString'

export function randomNumber(bytesAmount = 4) {
    return crypto.getRandomValues(new Uint8Array(bytesAmount))
        .reduce((accumulator, currentValue, index, buf) =>
                accumulator + currentValue * (0x100 ** (buf.length - 1 - index)),
            0)
}

export function generateId(bytesAmount = 4) {
    const int = randomNumber(bytesAmount)
    return numberToAlphanumeric(int)
}
