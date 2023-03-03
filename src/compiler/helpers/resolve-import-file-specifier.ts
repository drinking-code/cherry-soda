import fs from 'fs/promises'

import resolveFile from './resolve-file'
import projectRoot, {resolve as resolveProjectRoot} from '../../utils/project-root'

const packageJson = JSON.parse(await fs.readFile(resolveProjectRoot('package.json'), 'utf8'))

export default function resolveImportFileSpecifier(base: string, fileSpecifier: string) {
    if (fileSpecifier.startsWith('#')) {
        fileSpecifier = resolveProjectRoot(packageJson.imports[fileSpecifier])
    } else {
        fileSpecifier = resolveFile(base, fileSpecifier)
    }

    return fileSpecifier
}
