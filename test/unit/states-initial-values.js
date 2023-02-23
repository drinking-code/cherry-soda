export default {
    'boolean': false,
    'string': 'myString',
    'number': 42,
    'object': {
        myKey: 'myValue',
        mySecondValue: 42
    },
    'array': ['myItem', 42],
    'map': new Map(Object.entries({
        myKey: 'myValue',
        mySecondValue: 42
    })),
    'set': new Set(['myItem', 42]),
    'function': (a, b) => a + b,
}
