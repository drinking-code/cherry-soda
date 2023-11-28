import path from 'path'
import fs from 'fs'

fs.rmSync(path.resolve('.', 'package.json'))
fs.cpSync(path.resolve('.', '_package.json'), path.resolve('.', 'package.json'))
fs.rmSync(path.resolve('.', '_package.json'))
