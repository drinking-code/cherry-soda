import path from 'path'
import fs from 'fs'
import {chromium} from 'playwright'
import {jest} from '@jest/globals'

import {describe, test, expect} from '../bun:test-or-jest'
import testDir from '../temp-dir'
import makeFile, {pureStateInitialValues} from './states-example-component'
import statesInitialValues from './states-initial-values'
import {startNodeCompiler, stopNodeCompiler} from '../../src/compiler/node.lib'
import appRoot from '../../src/utils/project-root'
import makePeekablePromise from '../utils/peekable-promise'

let browser, context
beforeAll(async () => {
    browser = await chromium.launch({
        // devtools: true,
        // headless: false,
    })
    context = await browser.newContext()
})

let stopAppCompiler, stopAssetsCompiler
afterAll(async () => {
    await browser?.close()
    stopNodeCompiler()
    if (stopAppCompiler)
        stopAppCompiler()
    if (stopAssetsCompiler)
        stopAssetsCompiler()
    // fs.rmdirSync(testDir, {recursive: true})
})

const statesFrontendFiles = {...statesInitialValues}
for (let key in statesFrontendFiles) {
    if (!statesFrontendFiles.hasOwnProperty(key)) continue
    let resolve, reject
    statesFrontendFiles[key] = {
        promise: makePeekablePromise((res, rej) => [resolve, reject] = [res, rej]),
        resolve, reject
    }
}
describe('Converting states with module compiler', () => {
    let currentKey
    afterEach(() => {
        if (statesFrontendFiles[currentKey].promise.isPending())
            statesFrontendFiles[currentKey].reject()
    })
    for (const initialValuesKey in statesInitialValues) {
        const label = `Compiling state of type ${initialValuesKey}`
        // must use "pureStateInitialValues" because otherwise the istanbul injected code into the function value interferes
        // uses parenthesis around the value because of parse error (https://stackoverflow.com/questions/7985450/eval-unexpected-token-error)
        const stateInitialValue = eval(`(${pureStateInitialValues[initialValuesKey].replace(/\n */g, '')})`)

        const tempFileName = path.join(testDir, 'states.js')
        process.env.CHERRY_COLA_ENTRY = tempFileName

        const outputDir = appRoot.resolve('node_modules', '.cache', 'cherry-cola')
        const outputPath = path.join(outputDir, 'modules.js')

        test(label, async () => {
            currentKey = initialValuesKey
            // compile cherry-cola for node
            await startNodeCompiler()
            // start the app's code compiler
            const appCompilerModule = await import('#node:compiler')
            stopAppCompiler = appCompilerModule.stopAppCompiler
            const appCompilerEndEventTarget = appCompilerModule.endEventTarget

            const waitForCompileEnd = new Promise<void>(resolve => {
                appCompilerEndEventTarget.addEventListener('end', () => resolve(), {once: true})
            })
            // generate file (app that calls "createState()" with current initial value)
            const fileContents = makeFile(initialValuesKey)
            fs.writeFileSync(tempFileName, fileContents, 'utf8')
            // todo: expect module builder not toThrow
            // wait for the compiler (and module builder) to finish
            await waitForCompileEnd

            // read the generated modules.js file
            const modulesJsContents = fs.readFileSync(outputPath, 'utf8')
            // create no-ops for used functions (inside modules.js)
            const registerStateMappings = () => 0, execModules = () => 0
            // extract values passed to "createClientState()" (inside modules.js)
            let extractedValue
            const createClientState = value => extractedValue = value
            // execute the generated modules.js file (remove exports)
            eval(modulesJsContents.replace(/export/g, ''))
            if (typeof stateInitialValue === 'function')
                expect(extractedValue.toString().replace(/\s/g, ''))
                    .toEqual(stateInitialValue.toString().replace(/\s/g, ''))
            else
                expect(extractedValue).toEqual(stateInitialValue)

            // compile modules.js into the final fe-js (for the next test)
            const assetCompilerModule = await import('#node:asset-compiler')
            const {
                endEventTarget: assetCompilerEndEventTarget,
                outputPath: assetCompilerOutputPath,
            } = assetCompilerModule
            stopAssetsCompiler = assetCompilerModule.stopAssetsCompiler

            await new Promise<void>(resolve => {
                assetCompilerEndEventTarget.addEventListener('end', () => resolve(), {once: true})
            })
            statesFrontendFiles[initialValuesKey].path = path.join(testDir, `state.${initialValuesKey}.fe.js`)
            // copy the generated file, because the next iteration of this test will override it
            await fs.promises.cp(
                path.join(assetCompilerOutputPath, 'main.js'),
                statesFrontendFiles[initialValuesKey].path
            )
            // tell the next test that the file is ready
            statesFrontendFiles[initialValuesKey].resolve()
        })
    }
})

describe('Creating states on the client', () => {
    for (const initialValuesKey in statesInitialValues) {
        const label = `Creating state of type ${initialValuesKey}`
        const stateInitialValue = statesInitialValues[initialValuesKey]

        test(label, async () => {
            await expect(statesFrontendFiles[initialValuesKey].promise).resolves.toBe(undefined)
            const page = await context.newPage()
            const feScript = await fs.promises.readFile(statesFrontendFiles[initialValuesKey].path, 'utf8')
            let extractedValue
            page.on('console', async msg => {
                if (msg.text() !== 'value set') return
                extractedValue = page.evaluate('window.ccTestStateValue')
            })
            const handlePageError = jest.fn()
            page.on('pageerror', handlePageError)

            const scriptWithoutSingleLineComments = feScript.toString().replace(/\/{2}[^\n]+\n/g, '')
            await page.goto(`data:text/html,<!DOCTYPE html><html lang><body><script>${
                scriptWithoutSingleLineComments
            }</script></body></html>`)
            await page.waitForLoadState()

            expect(handlePageError).not.toHaveBeenCalled()
            await expect(extractedValue).resolves.toEqual(stateInitialValue)
        })
    }
})
