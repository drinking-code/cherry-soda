import path from 'path'
import fs from 'fs'

export default function findDirWith(entry) {
    let dirname = path.dirname((new URL(import.meta.url ?? 'file://' + __filename)).pathname)
    while (!fs.readdirSync(dirname).includes(entry))
        dirname = path.join(dirname, '..')

    return dirname
}
