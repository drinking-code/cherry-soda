import resolveFile from '../helpers/resolve-file.js'
import packageJson from '../../../package.json' assert {type: 'json'}
import moduleRoot from '../../utils/module-root.js'

const ExternaliseNodeModulesPlugin = {
    name: 'externalise-node-moules-plugin',
    setup(build) {
        build.onResolve({filter: /./}, args => {
            const isProxy = args.path.startsWith('#')
            if (isProxy) {
                args.path = moduleRoot.resolve(packageJson.imports[args.path])
            }
            const isAbsolute = args.path.startsWith('/')
            const isModule = !args.path.startsWith('.') && !isAbsolute
            const isEntry = args.kind === 'entry-point'

            const resolvedPath = !isModule && !isAbsolute
                ? resolveFile(args.resolveDir, args.path)
                : args.path

            const entryKey = new Map(
                Array.from(Object.entries(build.initialOptions.entryPoints))
                    .map(([a, b]) => [b, a])
            ).get(resolvedPath)

            return {
                path: (entryKey && !isEntry)
                    ? (args.resolveDir.replace(/\/cherry-cola\/.*$/, '/cherry-cola/lib/') + entryKey + '.js')
                    : resolvedPath,
                external: isModule || (entryKey && !isEntry)
            }
        })
    }
}

export default ExternaliseNodeModulesPlugin
