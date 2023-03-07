export function ensureArray<V = any>(mightBeArray: V | V[]): V[] {
    const isArray = (value: any): value is V[] => Array.isArray(value)
    return isArray(mightBeArray) ? mightBeArray : [mightBeArray]
}
