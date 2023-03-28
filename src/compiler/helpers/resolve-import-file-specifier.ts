import resolveFile from './resolve-file'
import projectRoot, {resolve as resolveProjectRoot} from '../../utils/project-root'
import moduleRoot, {resolve as resolveModuleRoot} from '../../utils/module-root'
import {printWarning, messages as warningMessages} from '../../messages/warnings'
import fs from 'fs'

const projectPackageJson = JSON.parse(fs.readFileSync(resolveProjectRoot('package.json'), 'utf8'))
const modulePackageJson = JSON.parse(fs.readFileSync(resolveModuleRoot('package.json'), 'utf8'))

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
