import path from 'path'
import fs from 'fs'

import {describe, test, expect} from '../bun:test-or-jest'
import testDir from '../temp-dir'
import makeFile, {pureStateInitialValues} from './states-example-component'
import statesInitialValues from './states-initial-values'
import {startNodeCompiler, stopNodeCompiler} from '../../src/compiler/node.lib'
import appRoot from '../../src/utils/project-root'
import compileAssets from './states.client.compile-assets'

let stopAppCompiler, stopAssetsCompiler
afterAll(async () => {
    stopNodeCompiler()
    if (stopAppCompiler)
        stopAppCompiler()
    if (stopAssetsCompiler)
        stopAssetsCompiler()
})

describe('Converting states with module compiler', () => {
    let currentKey
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
            eval(
                modulesJsContents
                    .replace(/export ?/g, '')
                    .replace(/import (([^\n]+?) from )?[^\n]+\n/g, (match, maybeFrom, importKey) => {
                        if (!importKey)
                            return ''
                        if (importKey.startsWith('{')) {
                            const keys = importKey
                                .substring(1, importKey.length - 1)
                                .split(', ')
                                .map(key => {
                                    const [match, imp, c2, as] = key.match(/([^ ]+)( as ([^ ]+))?/)
                                    return [imp, as ?? imp]
                                })
                            return keys.map(([imp, as]) => `const ${as} = null\n`)
                        }
                    })
            )
            if (typeof stateInitialValue === 'function')
                expect(extractedValue.toString().replace(/\s/g, ''))
                    .toEqual(stateInitialValue.toString().replace(/\s/g, ''))
            else
                expect(extractedValue).toEqual(stateInitialValue)

            stopAssetsCompiler = await compileAssets(initialValuesKey)
        })
    }
})
