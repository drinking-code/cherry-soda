import resolveFile from './resolve-file'
import projectRoot, {resolve as resolveProjectRoot} from '../../utils/project-root'
import moduleRoot, {resolve as resolveModuleRoot} from '../../utils/module-root'
import {printWarning, messages as warningMessages} from '../../messages/warnings'

const projectPackageJson = await (Bun.file(resolveProjectRoot('package.json')) as File & { json: () => object }).json()
const modulePackageJson = await (Bun.file(resolveModuleRoot('package.json')) as File & { json: () => object }).json()

export default function resolveImportFileSpecifier(base: string, fileSpecifier: string) {
    if (fileSpecifier.startsWith('#')) {
        if ('imports' in projectPackageJson)
            fileSpecifier = resolveProjectRoot(projectPackageJson.imports[fileSpecifier])
        else if ('imports' in modulePackageJson)
            fileSpecifier = resolveModuleRoot(modulePackageJson.imports[fileSpecifier])
        else
            printWarning(warningMessages.resolve.noImports, [fileSpecifier])
    } else {
        fileSpecifier = resolveFile(base, fileSpecifier)
    }

    return fileSpecifier
}
