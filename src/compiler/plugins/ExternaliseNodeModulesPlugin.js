import resolveFile from '../helpers/resolve-file.js'
import packageJson from '../../../package.json' assert {type: 'json'}

const ExternaliseNodeModulesPlugin = {
    name: 'resolve-node-moules-plugin',
    setup(build) {
        build.onResolve({filter: /./}, args => {
            const isProxy = args.path.startsWith('#')
            if (isProxy) {
                args.path = packageJson.imports[args.path]
            }
            const isAbsolute = args.path.startsWith('/')
            const isModule = !args.path.startsWith('.') && !isAbsolute
            const isEntry = args.kind === 'entry-point'

            const resolvedPath = !isModule
                ? (isAbsolute
                        ? args.path
                        : resolveFile(args.resolveDir, args.path)
                ) : args.path

            const entryKey = new Map(
                Array.from(Object.entries(build.initialOptions.entryPoints))
                    .map(([a, b]) => [b, a])
            ).get(resolvedPath)

            return {
                path: (entryKey && !isEntry)
                    ? (args.resolveDir
                            .replace(/\/cherry-cola\/.*$/, '/cherry-cola/lib/') +
                        entryKey + '.js'
                    )
                    : resolvedPath,
                external: isModule || (entryKey && !isEntry)
            }
        })
    }
}

export default ExternaliseNodeModulesPlugin
