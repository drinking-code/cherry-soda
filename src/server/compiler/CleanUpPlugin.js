import fs from 'fs'
import path from 'path'

export default {
    name: 'clean-up-plugin',
    async setup(build) {
        build.onStart(() => {
            const {outdir, outfile} = build.initialOptions
            if (outfile) {
                fs.rmSync(outfile)
            } else if (outdir) {
                const files = fs.readdirSync(outdir)
                files.forEach(file => {
                    fs.rmSync(path.join(outdir, file))
                })
            }
        })
    },
}
