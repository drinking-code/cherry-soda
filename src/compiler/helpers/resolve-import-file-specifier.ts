import fs from 'fs'
import path from 'path'

import resolveFile from './resolve-file'
import {resolve as resolveProjectRoot} from '../../utils/project-root'
import {resolve as resolveModuleRoot} from '../../utils/module-root'
import {printWarning, messages as warningMessages} from '../../messages/warnings'

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
    } else if (fileSpecifier.startsWith('.')) {
        fileSpecifier = resolveFile(base, fileSpecifier)
    } else {
        if (!fileSpecifier.includes('/')) {
            const modulePath = resolveProjectRoot('node_modules', fileSpecifier)
            const modulePackageJson = JSON.parse(fs.readFileSync(path.join(modulePath, 'package.json'), 'utf8'))
            const mainPath = modulePackageJson.main ?? modulePackageJson.module ?? 'index'
            fileSpecifier = resolveFile(modulePath, mainPath)
        } else {
            fileSpecifier = resolveFile(resolveProjectRoot('node_modules'), fileSpecifier)
        }
    }

    return fileSpecifier
}
