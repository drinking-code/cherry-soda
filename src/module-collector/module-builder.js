import * as fs from 'fs/promises'
import * as path from 'path'
import appRoot from 'app-root-path'

export const outputPath = appRoot.resolve(path.join('node_modules', '.cache', 'cherry-cola', 'modules.js'))

/**
 * @param {string} func
 * @param {Array<string>} parameters
 * @param {string} key
 * */
export async function addModule(func, parameters, key) {
    if ((await fs.stat(outputPath)).size === 0) {
        await fs.appendFile(outputPath, header)
    }
    const template = `\
modules.set('${key}', ${func})
`
    await fs.appendFile(outputPath, template)
}

const header = `\
export const modules = new Map()
export const states = new Map()
export const modulesStatesMap = new Map()
`
