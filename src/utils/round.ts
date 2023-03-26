export function roundToDecimal(number, place: number = 0) {
    return Math.round(number * 10 ** place) / 10 ** place
}
