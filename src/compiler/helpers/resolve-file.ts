import path from 'path'
import * as nfs from 'fs'

const possibleNames = ['index']
export const possibleExtensions = ['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx']

export default function resolveFile(basePath, file, fs = nfs) {
    const resolvedFilePath = path.join(basePath, file)
        .replace(/\.$/, '')

    // todo: resolve symlinks

    if (isExistingFile(resolvedFilePath, fs))
        return resolvedFilePath

    const resolvedPathWithExtension = checkPossibleExtensionsForPath(resolvedFilePath, fs)
    if (resolvedPathWithExtension)
        return resolvedPathWithExtension

    for (const possibleName of possibleNames) {
        const resolvedPathWithNameAndExtension = checkPossibleExtensionsForPath(
            path.join(resolvedFilePath, possibleName), fs
        )
        if (resolvedPathWithNameAndExtension)
            return resolvedPathWithNameAndExtension
    }
}

function checkPossibleExtensionsForPath(path, fs) {
    for (const possibleExtension of possibleExtensions) {
        const pathWithExtension = path + possibleExtension
        if (isExistingFile(pathWithExtension, fs)) {
            return pathWithExtension
        }
    }
    return false
}

function isExistingFile(path, fs) {
    return fs.existsSync(path) && fs.statSync(path).isFile()
}
