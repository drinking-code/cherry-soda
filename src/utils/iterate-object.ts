export function entriesArray<T>(object: { [key: string]: T }): [string, T][] {
    return Array.from(Object.entries(object))
}

export function iterateObject<T>(
    object: { [key: string]: T },
    mapFunction: (entry: [string, T], index: number, entries: [string, T][]) => void): void {
    entriesArray(object).forEach(mapFunction)
}

export function mapObject<T, U>(
    object: { [key: string]: T },
    mapFunction: (entry: [string, T], index: number, entries: [string, T][]) => [string, U]): { [key: string]: U } {
    return Object.fromEntries(
        entriesArray(object).map(mapFunction)
    )
}

export function filterObject<T>(
    object: { [key: string]: T },
    predicate: (entry: [string, T], index: number, entries: [string, T][]) => boolean): { [key: string]: T } {
    return Object.fromEntries(
        entriesArray(object).filter(predicate)
    )
}

export function mapObjectToArray<T, U>(
    object: { [key: string]: T },
    mapFunction: (entry: [string, T], index: number, entries: [string, T][]) => U): U[] {
    return entriesArray(object).map(mapFunction)
}

export function mapObjectValue<T, U>(
    object: { [key: string]: T },
    mapFunction: (value: T, index: number, entries: [string, T][]) => U): { [key: string]: U } {
    return mapObject(object, ([key, value], index, entries) =>
        [key, mapFunction(value, index, entries)]
    )
}

export function findInObject<T>(
    object: { [key: string]: T },
    predicate: (value: [string, T], index: number, entries: [string, T][]) => boolean): [string, T] {
    return entriesArray(object).find(predicate)
}

export function iterateMap<K, V>(
    map: Map<K, V>,
    mapFunction: (entry: [K, V], index: number, entries: [K, V][]) => void): void {
    Array.from(map.entries()).forEach(mapFunction)
}

export function mapMap<UK, UV, TK, TV>(
    map: Map<TK, TV>,
    mapFunction: (entry: [TK, TV], index: number, entries: [TK, TV][]) => [UK, UV]): Map<UK, UV> {
    return new Map(
        Array.from(map.entries())
            .map(mapFunction)
    )
}
