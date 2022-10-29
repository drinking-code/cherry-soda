import {build} from 'esbuild'
import fs from 'fs'

const filePath = 'lib/jsx-runtime.cjs'
await build({
    entryPoints: ['../src/jsx-runtime.ts'],
    outfile: filePath,
    platform: 'node',
    bundle: true,
    sourcemap: 'inline',
    external: ['../node_modules/*'],
    plugins: [{
        name: 'remove-top-level-await',
        setup(build) {
            const iposFiles = [
                'head.jsx',
                'do-something.ts',
                'module-compiler/index.ts',
                'module-compiler/imports.ts',
            ]
            const regexString = `(${iposFiles.join('|').replace(/([./])/g, '\\$1')})$`
            build.onLoad({filter: new RegExp(regexString)}, (options) => {
                const fileContents = fs.readFileSync(options.path, {encoding: 'utf8'})
                    .replace(
                        /const ipos(: IPOS)? = await iposPromise/g,
                        "let ipos;(async () => {\n    ipos = await iposPromise;"
                    )
                    .split("\n")

                const iposIndex = fileContents.indexOf(fileContents.find(line => line.endsWith('await iposPromise;')))
                let index = iposIndex + 1
                while (fileContents[index].includes('ipos'))
                    index++
                fileContents.splice(index, 0, '})();')

                // console.log(options.path)
                // console.log(fileContents.join("\n"))
                return {
                    contents: fileContents.join("\n"),
                    loader: 'tsx'
                }
            })

        }
    }]
})
