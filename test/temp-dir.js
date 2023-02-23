import path from 'path'
import fs from 'fs'

const dir = path.resolve('test', '__generated')
if (!fs.existsSync(dir))
    fs.mkdirSync(dir, {recursive: true})

export default dir
