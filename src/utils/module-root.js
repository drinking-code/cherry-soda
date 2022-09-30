import path from 'path'
import fs from 'fs'
import findDirWith from './find-dir-with.js'

const moduleRoot = {
    resolve(...filePath) {
        if (!process.env.APP_MODULE_PATH)
            findModuleRoot()

        return path.join(process.env.APP_MODULE_PATH, ...filePath)
    }
}

function findModuleRoot() {
    process.env.APP_MODULE_PATH = findDirWith('package.json')
}
findModuleRoot()

export default moduleRoot
