import fsSync from 'fs'
import path from 'path'

import appRoot from '../../utils/project-root.js'

const outputDir = appRoot.resolve(path.join('node_modules', '.cache', 'cherry-cola'))
const outputPath = path.join(outputDir, 'modules.js')
if (!fsSync.existsSync(outputPath)) {
    fsSync.mkdirSync(outputDir, {recursive: true})
    fsSync.writeFileSync(outputPath, '', {encoding: 'utf8'})
}
export default outputPath
