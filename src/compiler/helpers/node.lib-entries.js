import moduleRoot from '../../utils/module-root.js'

export const entryPoints = {
    'cherry-cola': moduleRoot.resolve('src', 'index.ts'),
    'compiler': moduleRoot.resolve('src', 'compiler', 'node.app.js'),
    'asset-compiler': moduleRoot.resolve('src', 'compiler', 'assets.js'),
    'render-element': moduleRoot.resolve('src', 'jsx', 'dom', 'render.tsx'),
    'render-function': moduleRoot.resolve('src', 'server', 'render.js'),
    'renderer': moduleRoot.resolve('src', 'server', 'renderer.js'),
    'iterate-function-components': moduleRoot.resolve('src', 'compiler', 'module-compiler', 'iterate-function-components.ts'),
}

const entryPointsReverseMap = new Map(
    Array.from(Object.entries(entryPoints))
        .map(([a, b]) => [b, a])
)

export function getEntryPointKey(path) {
    return entryPointsReverseMap.get(path)
}
