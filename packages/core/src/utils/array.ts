export function ensureArray<V>(value: V | V[]): V[] {
    return Array.isArray(value) ? value : [value]
}
