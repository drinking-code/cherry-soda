const states = new Map()

function MakeMutable(PrimitiveWrapper) {
    return class Mutable extends PrimitiveWrapper {
        constructor(value) {
            super(value)
            this.value = value
        }

        valueOf() {
            return this.value
        }

        clone() {
            return new Mutable(this.valueOf())
        }
    }
}

export function createClientState(value, id) {
    states.set(id, new (MakeMutable(Number))(value))
    const clone = states.get(id).clone()

    function changeValue(newValue) {
        if (states.get(id).valueOf() === newValue) {
            return false
        }
        states.get(id).value = newValue
        clone.value = newValue
        return true
    }

    return [clone, changeValue]
}
