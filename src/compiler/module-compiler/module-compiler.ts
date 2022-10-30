import {VirtualElement} from '../../jsx/VirtualElement'
import {iterateFunctionComponents} from './iterate-function-components'
import {buildFile} from './build-file'

console.log(process.env.CHERRY_COLA_ENTRY)

const serverOutputPath = process.argv[2]
const App: () => VirtualElement = (await import(`${serverOutputPath}/App.mjs`)).main

iterateFunctionComponents(App(), true)
await buildFile()
process.exit(0)
