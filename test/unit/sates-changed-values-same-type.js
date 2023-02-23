export default {
    'boolean': true,
    'string': 'myOtherString',
    'number': 24,
    'object': {
        myOtherKey: 'myOtherValue',
        myThirdValue: 24
    },
    'array': ['myOtherItem', 24],
    'map': new Map(Object.entries({
        myKey: 'myOtherValue',
        myThirdValue: 24
    })),
    'set': new Set(['myOtherItem', 24]),
    'function': (a, b) => a - b,
}
