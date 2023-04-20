// most stupid way to make the alphabet
const firstLetterCode = 'a'.charCodeAt(0)
const smallLetters = Array(26).fill('')
    .map((v, i) => String.fromCharCode(firstLetterCode + i))
    .join('')
const numbers: string = Array(10).fill('')
    .map((v, i) => i.toString())
    .join('')


const alphaNumeric = numbers + smallLetters + smallLetters.toUpperCase()
export function numberToAlphanumeric(number: number, maxLength?: number): string {
    return numberToString(number, alphaNumeric, maxLength)
}

const alphabetic = smallLetters + smallLetters.toUpperCase()
export function numberToAlphabetic(number: number, maxLength?: number): string {
    return numberToString(number, alphabetic, maxLength)
}

const hex = numbers + smallLetters.slice(0, 6)
export function numberToHex(number: number, maxLength?: number): string {
    return numberToString(number, hex, maxLength)
}

function numberToString(number: number, alphabet: string, maxLength?: number): string {
    const base = alphabet.length
    let result = ''
    while (number > 0 && (!maxLength || result.length < maxLength)) {
        result += alphabet[number % base]
        number = Math.floor(number / base)
    }
    return result
}
