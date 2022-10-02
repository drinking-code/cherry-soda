import moduleRoot from '../../utils/module-root.js'

export const entryPoints = {
    'cherry-cola': moduleRoot.resolve('src', 'index.ts'),
    'compiler': moduleRoot.resolve('src', 'compiler', 'node.app.js'),
    'asset-compiler': moduleRoot.resolve('src', 'compiler', 'assets.js'),
    'module-compiler': moduleRoot.resolve('src', 'compiler', 'module-compiler', 'module-compiler.ts'),
    'render-element': moduleRoot.resolve('src', 'jsx', 'dom', 'render.tsx'),
    'render-function': moduleRoot.resolve('src', 'server', 'render.js'),
    'renderer': moduleRoot.resolve('src', 'server', 'renderer.js'),
}

const entryPointsReverseMap = new Map(
    Array.from(Object.entries(entryPoints))
        .map(([a, b]) => [b, a])
)

export function getEntryPointKey(path) {
    return entryPointsReverseMap.get(path)
}
