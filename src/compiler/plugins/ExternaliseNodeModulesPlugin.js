import path from 'path'

import resolveFile from '../helpers/resolve-file.js'
import packageJson from '../../../package.json' assert {type: 'json'}
import tsConfig from '../../../tsconfig.json' assert {type: 'json'}
import moduleRoot from '../../utils/module-root.js'
import {getEntryPointKey} from '../helpers/node.lib-entries.js'

const ExternaliseNodeModulesPlugin = {
    name: 'externalise-node-moules-plugin',
    setup(build) {
        const libDir = moduleRoot.resolve('lib')
        const expectedJSXRuntimePath = path.join(tsConfig.compilerOptions.jsxImportSource, 'jsx-runtime')

        function getLibPathIfEntry(filePath) {
            const entryKey = getEntryPointKey(filePath)
            if (!entryKey)
                return false
            return path.join(libDir, entryKey + '.js')
        }

        build.onResolve({filter: /^#/}, args => {
            args.path = moduleRoot.resolve(packageJson.imports[args.path])
            const libPath = getLibPathIfEntry(args.path)
            return {
                path: libPath || args.path,
                external: !!libPath
            }
        })

        build.onResolve({filter: /^[A-Za-z@]/}, args => {
            if (args.path === expectedJSXRuntimePath)
                return {
                    path: resolveFile(process.env.APP_MODULE_PATH, args.path),
                }
            else
                return {
                    path: args.path,
                    external: true
                }
        })
    }
}

export default ExternaliseNodeModulesPlugin
