const states = {}

function generateId() {
    const array = new Uint32Array(1)
    self.crypto.getRandomValues(array)
    return array[0].toString(16)
}

function MakeMutable(PrimitiveWrapper) {
    return class Mutable extends PrimitiveWrapper {
        constructor(value) {
            super(value)
            this.value = value
        }

        valueOf() {
            return this.value
        }
    }
}

export function createClientState(value) {
    let id
    do {
        id = generateId()
    } while (id in states)

    states[id] = new (MakeMutable(Number))(value)

    function changeValue(newValue) {
        states[id].value = newValue
    }

    return [states[id], changeValue]
}
