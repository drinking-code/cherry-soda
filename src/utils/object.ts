export function isObject<V = any>(item: V | { [key: string]: V }): item is { [key: string]: V } {
    return (item && typeof item === 'object' && item.constructor === {}.constructor)
}

export function mergeDeep(target, source) {
    function applyValue(target, key, value) {
        if (isObject(value)) {
            if (!isObject(target[key]))
                target[key] = {}
            applyObject(target[key], value)
        } else if (Array.isArray(value)) {
            if (!Array.isArray(target[key]))
                target[key] = []
            applyArray(target[key], value)
        } else {
            target[key] = value
        }
    }

    function applyObject(target, object) {
        for (const key in object) {
            if (!object.hasOwnProperty(key)) continue
            applyValue(target, key, object[key])
        }
    }

    function applyArray(target, array) {
        const targetLength = target.length
        for (let i = targetLength, j = 0;
             j < array.length;
             i++, j++
        ) {
            applyValue(target, i, array[j])
        }
    }

    applyObject(target, source)

    return target
}

export function cloneDeep(object) {
    return mergeDeep({}, object)
}
