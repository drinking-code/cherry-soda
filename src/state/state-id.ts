export function generateId(bytesAmount = 4) {
    const int = crypto.getRandomValues(new Uint8Array(bytesAmount))
        .reduce((accumulator, currentValue, index, buf) =>
                accumulator + currentValue * (0x100 ** (buf.length - 1 - index)),
            0)
    return numberToAlphanumeric(int)
}

function numberToAlphanumeric(number: number) {
    // most stupid way to make the alphabet
    const firstLetterCode = 'a'.charCodeAt(0)
    const smallLetters: string = Array(26).fill('')
        .map((v, i) => String.fromCharCode(firstLetterCode + i))
        .join('')
    const numbers: string = Array(10).fill('')
        .map((v, i) => i.toString())
        .join('')
    const alphabet = numbers + smallLetters + smallLetters.toUpperCase()

    // conversion
    const base = alphabet.length
    let res = ''
    while (number > 0) {
        res += alphabet[number % base]
        number = Math.floor(number / base)
    }
    return res
}

export type SerializedStateId = string

export class StateId {
    protected value: string

    constructor() {
        this.value = generateId()
    }

    serialize(): SerializedStateId {
        return this.value
    }

    static from(data: SerializedStateId) {
        const newStateId = new StateId()
        newStateId.value = data
        return newStateId
    }
}
