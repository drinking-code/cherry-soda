export function isArray<V = any>(value: V | V[]): value is V[] {
    return Array.isArray(value)
}

export function ensureArray<V = any>(mightBeArray: V | V[]): V[] {
    if (isArray(mightBeArray))
        return mightBeArray
    else
        return [mightBeArray]
}
