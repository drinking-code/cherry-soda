import fs from 'fs'
import isFunctionComponent from '../helpers/is-function-component.node.js'

export default function extractClientCodePlugin() {
    return {
        name: 'extract-client-code-plugin',
        async setup(build) {
            /*build.onLoad({filter: /\.[jt]sx?$/}, async (args) => {
                const fileContents = await fs.promises.readFile(args.path, 'utf8')
                if (!(await isFunctionComponent(fileContents)))
                    return {
                        contents: fileContents,
                        loader: 'tsx',
                    }
                else {
                    // extract doSomething
                    console.log(args.path)
                    return {
                        contents: fileContents,
                        loader: 'tsx',
                    }
                }
            })*/
        },
    }
}
