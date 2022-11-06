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

let browser, context
beforeAll(async () => {
    const browser = await chromium.launch()
    context = await browser.newContext()
})

let stopAppCompiler, stopRenderer
afterAll(async () => {
    await browser?.close()
    stopNodeCompiler()
    stopAppCompiler()
    // stopRenderer()
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

type PeekablePromiseType<T> = Promise<T> & {
    isPending: boolean,
    isRejected: boolean,
    isFulfilled: boolean,
}

function makePeekablePromise<T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): PeekablePromiseType<T> {
    let isPending: boolean = true
    let isRejected: boolean = false
    let isFulfilled: boolean = false


    const promise = new Promise((resolve, reject) => {
        executor(value => {
            isFulfilled = true
            isPending = false
            resolve(value)
        }, error => {
            isRejected = true
            isPending = false
            reject(error)
        })
    }) as PeekablePromiseType<T>

    Object.assign(promise, {
        isPending() {
            return isPending
        },
        isRejected() {
            return isRejected
        },
        isFulfilled() {
            return isFulfilled
        },
    })

    return promise
}

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
        const stateInitialValue = statesInitialValues[initialValuesKey]

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
            expect(extractedValue).toEqual(stateInitialValue)

            // compile modules.js into the final fe-js (for the next test)
            const {
                endEventTarget: assetCompilerEndEventTarget,
                outputPath: assetCompilerOutputPath
            } = await import('#node:asset-compiler')

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
        // const stateInitialValue = statesInitialValues[initialValuesKey]

        test(label, async () => {
            await expect(statesFrontendFiles[initialValuesKey].promise).resolves.toBe(undefined)
            const page = await context.newPage()
            const feScript = await fs.promises.readFile(statesFrontendFiles[initialValuesKey].path, 'utf8')
            page.on('console', async msg => {
                const values = []
                for (const arg of msg.args())
                    values.push(await arg.jsonValue())
                console.log(...values)
            })
            page.on('pageerror', exception => {
                console.log(`Uncaught exception: "${exception}"`);
            })
            await page.goto(`data:text/html,<html lang><body><script>${feScript}</script></body></html>`)
        })
    }
})

