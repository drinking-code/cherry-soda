import fs from 'fs'
import path from 'path'

export default {
    name: 'clean-up-plugin',
    async setup(build) {
        build.onStart(() => {
            let {outdir, outfile} = build.initialOptions
            if (outfile) {
                outdir = outfile.replace(/[^/]+$/, '')
            }
            const files = fs.readdirSync(outdir)
            files.forEach(file => {
                try {
                    fs.rmSync(path.join(outdir, file))
                } catch (e) {
                    // fail silently
                }
            })
        })
    },
}
