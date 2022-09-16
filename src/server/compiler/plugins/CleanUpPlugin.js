import fs from 'fs/promises'
import path from 'path'

export default {
    name: 'clean-up-plugin',
    setup(build) {
        build.onStart(async () => {
            let {outdir, outfile} = build.initialOptions
            if (outfile) {
                outdir = path.dirname(outfile)
            }
            const files = await fs.readdir(outdir)
            await Promise.all(files.map(file => {
                try {
                    return fs.rm(path.join(outdir, file))
                } catch (e) {
                    // fail silently
                }
            }))
        })
    },
}
