import fs from 'fs'
import path from 'path'

const newLine = "\n"
const imports = `import {createState, doSomething} from '#cherry-cola'`

const mainFunction = `export const main = () => <App/>`
const indent = (string, indentAmount) => Array(4 * indentAmount).fill(' ').join('') + string
const combineArray = array => array.reduce((a, b) => {
    if (!a.endsWith(newLine))
        a += newLine
    return a + b
})
const component = stateInitialValue => combineArray([
    'function App() {',
    indent(`const state = createState(${stateInitialValue})`, 1),
    newLine,
    indent('doSomething(([state, setState]) => {', 1),
    indent('console.log(state)', 2),
    indent('}, [state])', 1),
    newLine,
    indent('return <div/>', 1),
    '}'
])

const stateInitialValuesEntries = fs.readFileSync(
    path.resolve('test', 'unit', 'states-initial-values.js'),
    'utf8'
)
    .split(newLine)
    .filter(line => !/^\s*\/\//.test(line))
    .map(line => line.trim())
    .map((line, index, allLines) => {
        while (index < allLines.length - 1 && !(
            allLines[index + 1].match(/^["']/) ||
            allLines[index + 1].match(/}$/)
        )) {
            if (index > allLines.length) break
            line += newLine
            line += allLines[++index]
        }
        return line
    })
    .filter(line => line.match(/^["']/))
    // split into key, value
    .map(line => line.split(': '))
    // recombine split into values
    .map(([key, ...value]) => [key, value.join(': ')])
    .map(([key, value]) => [
        key.replace(/^['"](.+)['"]$/, '$1'),
        value.replace(/[,\s\n]$/, '')
    ])

export const pureStateInitialValues = Object.fromEntries(stateInitialValuesEntries)
export default function makeFile(stateInitialKey) {
    const stateInitialValue = pureStateInitialValues[stateInitialKey]
    return combineArray([
        imports,
        newLine,
        mainFunction,
        newLine,
        component(stateInitialValue)
    ]) + newLine
}
