import {describe, test, expect} from '../bun:test-or-jest'
import createState from '../../src/state/index'

export const examples = {
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
    'function': (a: number, b: number) => a + b,
    // 'class': new TestClass('myClass'),
}

describe('Creating states on the server', () => {
    for (const exampleKey in examples) {
        const keyStartsWithVowel = ['a', 'e', 'i', 'o', 'u'].some(vowel => exampleKey.startsWith(vowel))
        const label = `Creating state of type ${keyStartsWithVowel ? 'an' : 'a'} ${exampleKey}`
        const exampleValue = examples[exampleKey]

        test(label, () => {
            let state
            expect(() => state = createState(exampleValue)).not.toThrow()
            expect(state).toBeDefined()
        })
    }
})
