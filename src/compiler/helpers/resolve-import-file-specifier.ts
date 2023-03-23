import resolveFile from './resolve-file'
import projectRoot, {resolve as resolveProjectRoot} from '../../utils/project-root'
import {printWarning, messages as warningMessages} from '../../messages/warnings'

const packageJson = await (Bun.file(resolveProjectRoot('package.json')) as File & { json: () => object }).json()

export default function resolveImportFileSpecifier(base: string, fileSpecifier: string) {
    if (fileSpecifier.startsWith('#')) {
        if ('imports' in packageJson)
            fileSpecifier = resolveProjectRoot(packageJson.imports[fileSpecifier])
        else
            printWarning(warningMessages.resolve.noImports, [fileSpecifier])
    } else {
        fileSpecifier = resolveFile(base, fileSpecifier)
    }

    return fileSpecifier
}
