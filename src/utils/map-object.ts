export function iterateObject<T>(
    object: { [key: string]: T },
    mapFunction: (entry: [string, T], index: number, entries: [string, T][]) => void): void {
    Array.from(Object.entries(object)).forEach(mapFunction)
}

export function mapObject<U, T>(
    object: { [key: string]: T },
    mapFunction: (entry: [string, T], index: number, entries: [string, T][]) => [string, U]): { [key: string]: U } {
    return Object.fromEntries(
        Array.from(Object.entries(object))
            .map(mapFunction)
    )
}

export function mapObjectValue<U, T>(
    object: { [key: string]: T },
    mapFunction: (value: T, index: number, entries: [string, T][]) => U): { [key: string]: U } {
    return mapObject(object, ([key, value], index, entries) =>
        [key, mapFunction(value, index, entries)]
    )
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
