import path from 'path'
import fs from 'fs'
import findDirWith from './find-dir-with.js'

const appRoot = {
    resolve(...filePath) {
        if (!process.env.APP_ROOT_PATH)
            findAppRoot()

        return path.join(process.env.APP_ROOT_PATH, ...filePath)
    }
}

function findAppRoot() {
    process.env.APP_ROOT_PATH = findDirWith('package.json')
}
findAppRoot()

export default appRoot
