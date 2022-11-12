import {describe, test, expect} from '../bun:test-or-jest'
import {createState} from '#cherry-cola'
import statesInitialValues from './states-initial-values'
import {default as iposPromise} from '../../src/ipos'

const ipos = await iposPromise
ipos.create('clientAssets', ['main.js', 'main.css'])
process.env.BUN_ENV = 'development'

describe('Creating states on the server', () => {
    for (const initialValuesKey in statesInitialValues) {
        const label = `Creating state of type ${initialValuesKey}`
        const stateInitialValue = statesInitialValues[initialValuesKey]

        test(label, () => {
            let state
            expect(() => state = createState(stateInitialValue)).not.toThrow()
            expect(state).toBeDefined()
        })
    }
})

describe.skip('Changing type of a state after creation', () => {

})
