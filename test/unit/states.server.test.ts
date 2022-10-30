import path from 'path'
import fs from 'fs'
import {chromium} from 'playwright'

import {describe, test, expect} from '../bun:test-or-jest'
import testDir from '../temp-dir'
import {createState} from '#cherry-cola'
import makeFile from './states-example-component'
import statesInitialValues from './states-initial-values'
import startNodeCompiler from '../../src/compiler/node.lib.js'

let browser, page
beforeAll(async () => browser = await chromium.launch())
afterAll(async () => await browser.close())
beforeEach(async () => page = await browser.newPage())
afterEach(async () => await page.close())

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

describe('Converting states with module compiler', () => {
    for (const initialValuesKey in statesInitialValues) {
        const label = `Compiling state of type ${initialValuesKey}`
        const stateInitialValue = statesInitialValues[initialValuesKey]

        const tempFileName = path.join(testDir, 'states.js')
        process.env.CHERRY_COLA_ENTRY = tempFileName

        test(label, async () => {
            await startNodeCompiler()
            const {endEventListener} = await import('#node:compiler')
            const {default: render} = await import('#node:render-function')

            const fileContents = makeFile(initialValuesKey)
            fs.writeFileSync(tempFileName, fileContents, 'utf8')
            console.log('wait for compiler')
            await new Promise<void>(resolve => {
                endEventListener.addEventListener('end', () => {
                    resolve()
                }, {once: true})
            })
            await import('#node:asset-compiler')
            console.log(await render())
        })
    }
})
