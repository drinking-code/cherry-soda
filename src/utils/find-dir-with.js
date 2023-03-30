import path from 'path'
import fs from 'fs'

export default function findDirWithAndNot(has, andNot) {
    let dirname = path.dirname((new URL(import.meta.url ?? 'file://' + __filename)).pathname)
    while (!fs.readdirSync(dirname).includes(has) || (andNot && fs.readdirSync(dirname).includes(andNot)))
        dirname = path.join(dirname, '..')

    return dirname
}
