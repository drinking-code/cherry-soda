import path from 'path'
import fs from 'fs'
import {chromium} from 'playwright'

import {describe, test, expect} from '../bun:test-or-jest'
import testDir from '../temp-dir'
import {createState} from '#cherry-cola'
import makeFile from './states-example-component'
import statesInitialValues from './states-initial-values'
import {startNodeCompiler, stopNodeCompiler} from '../../src/compiler/node.lib.js'
import {default as iposPromise} from '../../src/ipos'
import appRoot from '../../src/utils/project-root'

const ipos = await iposPromise
ipos.create('clientAssets', ['main.js', 'main.css'])
process.env.BUN_ENV = 'development'

// let browser, page
// beforeAll(async () => browser = await chromium.launch())
// afterAll(async () => await browser.close())
// beforeEach(async () => page = await browser.newPage())
// afterEach(async () => await page.close())

let stopAppCompiler, stopRenderer
afterAll(() => {
    stopNodeCompiler()
    stopAppCompiler()
    stopRenderer()
    // fs.rmdirSync(testDir, {recursive: true})
})

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

        const outputDir = appRoot.resolve('node_modules', '.cache', 'cherry-cola')
        const outputPath = path.join(outputDir, 'modules.js')

        test(label, async () => {
            // todo: expect not toThrow in module builder
            await startNodeCompiler()
            const appCompilerModule = await import('#node:compiler')
            stopAppCompiler = appCompilerModule.stopAppCompiler
            const endEventListener = appCompilerModule.endEventListener
            const renderFunctionModule = await import('#node:render-function')
            const render = renderFunctionModule.default
            stopRenderer = renderFunctionModule.stopRenderer

            const waitForCompileEnd = new Promise<void>(resolve => {
                endEventListener.addEventListener('end', () => {
                    resolve()
                }, {once: true})
            })
            const fileContents = makeFile(initialValuesKey)
            fs.writeFileSync(tempFileName, fileContents, 'utf8')
            await waitForCompileEnd

            expect(async () => await render()).not.toThrow()
            const modulesJsContents = fs.readFileSync(outputPath, 'utf8')
            const registerStateMappings = () => 0, execModules = () => 0
            let extractedValue
            const createClientState = value => extractedValue = value
            eval(modulesJsContents.replace(/export/g, ''))
            expect(extractedValue).toEqual(stateInitialValue)
        })
    }
})
