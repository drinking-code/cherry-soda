import path from 'path'
import fs from 'fs'

import console from '../../utils/console.js'

const possibleNames = ['index']
export const possibleExtensions = ['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx']

export default function resolveFile(basePath, file) {
    const resolvedFilePath = path.join(basePath, file)
        .replace(/\.$/, '')

    // todo: resolve symlinks

    if (isExistingFile(resolvedFilePath))
        return resolvedFilePath

    const resolvedPathWithExtension = checkPossibleExtensionsForPath(resolvedFilePath)
    if (resolvedPathWithExtension)
        return resolvedPathWithExtension

    for (const possibleName of possibleNames) {
        const resolvedPathWithNameAndExtension = checkPossibleExtensionsForPath(
            path.join(resolvedFilePath, possibleName)
        )
        if (resolvedPathWithNameAndExtension)
            return resolvedPathWithNameAndExtension
    }
}

function checkPossibleExtensionsForPath(path) {
    for (const possibleExtension of possibleExtensions) {
        const pathWithExtension = path + possibleExtension
        if (isExistingFile(pathWithExtension)) {
            return pathWithExtension
        }
    }
    return false
}

function isExistingFile(path) {
    return fs.existsSync(path) && fs.statSync(path).isFile()
}
