import fs from 'fs'
import projectRoot from '../src/utils/project-root.js'

export default async () => {
    await fs.promises.rmdir(projectRoot.resolve('test', '__generated'), {recursive: true})
}
