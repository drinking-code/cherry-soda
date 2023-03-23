// most stupid way to make the alphabet
const firstLetterCode = 'a'.charCodeAt(0)
const smallLetters = Array(26).fill('')
    .map((v, i) => String.fromCharCode(firstLetterCode + i))
    .join('')
const numbers: string = Array(10).fill('')
    .map((v, i) => i.toString())
    .join('')

export function numberToAlphanumeric(number: number): string {
    const alphabet = numbers + smallLetters + smallLetters.toUpperCase()
    return numberToString(number, alphabet)
}

export function numberToAlphabetic(number: number): string {
    const alphabet = smallLetters + smallLetters.toUpperCase()
    return numberToString(number, alphabet)
}

export function numberToHex(number: number): string {
    const alphabet = numbers + smallLetters.slice(0, 6)
    return numberToString(number, alphabet)
}

function numberToString(number: number, alphabet: string): string {
    const base = alphabet.length
    let result = ''
    while (number > 0) {
        result += alphabet[number % base]
        number = Math.floor(number / base)
    }
    return result
}
