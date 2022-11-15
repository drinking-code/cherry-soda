import fs from 'fs'
import {chromium} from 'playwright'
import {jest} from '@jest/globals'

import {describe, test, expect} from '../bun:test-or-jest'
import statesInitialValues from './states-initial-values'
import {waitForStatesFrontendFile, getStatesFrontendFileName} from './states-frontend-files'

let browser, context
beforeAll(async () => {
    browser = await chromium.launch({
        // devtools: true,
        // headless: false,
    })
    context = await browser.newContext()
})

afterAll(async () => {
    await browser?.close()
})

describe('Creating states on the client', () => {
    for (const initialValuesKey in statesInitialValues) {
        const label = `Creating state of type ${initialValuesKey}`
        const stateInitialValue = statesInitialValues[initialValuesKey]

        test(label, async () => {
            console.log('waiting for file')
            await expect(waitForStatesFrontendFile(initialValuesKey)).resolves.toBe(undefined)
            const page = await context.newPage()
            const feScript = await fs.promises.readFile(getStatesFrontendFileName(initialValuesKey), 'utf8')
            let isSameValue: false | Promise<boolean> = undefined
            page.on('console', async msg => {
                if (msg.text() !== 'value set') return console.log(msg)
                isSameValue = page.evaluate(stateInitialValue => {
                    console.log(stateInitialValue, window['ccTestStateValue'])
                    // @ts-ignore
                    return isEqual(stateInitialValue, window['ccTestStateValue'])
                }, stateInitialValue)
            })
            const handlePageError = jest.fn(console.error)
            page.on('pageerror', handlePageError)

            await page.goto(`data:text/html,<!DOCTYPE html><html lang></html>`)
            await page.waitForLoadState()
            await page.setContent(`<!DOCTYPE html><html lang><body><script>${feScript}</script></body></html>`)

            expect(handlePageError).not.toHaveBeenCalled()
            expect(await isSameValue).toBeTruthy()
        })
    }
})
