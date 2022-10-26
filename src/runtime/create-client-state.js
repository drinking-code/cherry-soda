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

export function getState(id) {
    return states.get(id)
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
        updateStateInElementText(id)
        return true
    }

    return [clone, changeValue]
}

// todo: states in attributes

let stateMappings = {}

export function registerStateMappings(sm) {
    stateMappings = sm
}

function updateStateInElementText(stateId) {
    stateMappings[stateId]?.forEach(usage => {
        // todo: take "childrenBefore" into account
        usage.element.innerText = usage.content
            .map(value => value.valueOf())
            .join('')
    })
}
