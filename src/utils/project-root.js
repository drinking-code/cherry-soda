import path from 'path'
import fs from 'fs'

const appRoot = {
    resolve(filePath) {
        if (!process.env.APP_ROOT_PATH)
            findAppRoot()

        return path.join(process.env.APP_ROOT_PATH, filePath)
    }
}

// finds first parent directory from this file in which "node_modules" exists
function findAppRoot() {
    let dirname = path.dirname((new URL(import.meta.url)).pathname)
    while (!fs.readdirSync(dirname).includes('node_modules'))
        dirname = path.join(dirname, '..')

    process.env.APP_ROOT_PATH = dirname
}
findAppRoot()

export default appRoot
