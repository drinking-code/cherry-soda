import path from 'path'
import findDirWithAndNot from './find-dir-with.js'

process.env.PROJECT_ROOT_PATH = findDirWithAndNot('node_modules', '.dev-marker-cs')
export default process.env.PROJECT_ROOT_PATH

export function resolve(...filePath) {
    return path.join(process.env.PROJECT_ROOT_PATH, ...filePath)
}
