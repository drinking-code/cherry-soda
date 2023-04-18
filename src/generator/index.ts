import * as nfs from 'fs'
import path from 'path'

import compile from '../compiler'
import {getRenderer} from '../renderer/renderer'
import {getBundlerReadyPromise} from '../compiler/bundler/bundler-ready-promise'

const {fs, outputPath} = compile(process.env.CHERRY_SODA_ENTRY)
const render = getRenderer()
// todo: get all routes via a standardised route api / cli options
getBundlerReadyPromise()
    .then(() => {
        const html = render() // todo: warn if there are (non-deterministic) sideEffects (excluding internal)
        // todo: don't use memfs, could use way to much memory, create a cache dir in project root
        nfs.mkdirSync(process.env.CHERRY_SODA_OUTPUTPATH, {recursive: true})
        nfs.writeFileSync(path.join(process.env.CHERRY_SODA_OUTPUTPATH, 'index.html'), html)
        fs.readdirSync(outputPath).forEach(fileName => {
            nfs.writeFileSync(path.join(process.env.CHERRY_SODA_OUTPUTPATH, fileName),
                fs.readFileSync(path.join(outputPath, fileName))
            )
        })
        // todo: print stats
    })
