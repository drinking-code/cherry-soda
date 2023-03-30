import path from 'path'
import findDirWithAndNot from './find-dir-with.js'

process.env.APP_MODULE_PATH = findDirWithAndNot('package.json')
export default process.env.APP_MODULE_PATH

export function resolve(...filePath) {
    return path.join(process.env.APP_MODULE_PATH, ...filePath)
}
