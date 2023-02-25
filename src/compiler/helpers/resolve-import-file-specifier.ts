import fs from 'fs/promises'

import resolveFile from './resolve-file'
import projectRoot from '../../utils/project-root'

const packageJson = JSON.parse(await fs.readFile(projectRoot.resolve('package.json'), 'utf8'))

export default function resolveImportFileSpecifier(base: string, fileSpecifier: string) {
    if (fileSpecifier.startsWith('#')) {
        fileSpecifier = projectRoot.resolve(packageJson.imports[fileSpecifier])
    } else {
        fileSpecifier = resolveFile(base, fileSpecifier)
    }

    return fileSpecifier
}
