import path from 'path'
import findDirWith from './find-dir-with.js'

process.env.PROJECT_ROOT_PATH = findDirWith('node_modules')
export default process.env.PROJECT_ROOT_PATH

export function resolve(...filePath) {
    return path.join(process.env.PROJECT_ROOT_PATH, ...filePath)
}
