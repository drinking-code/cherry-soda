export default {
    resolver: '<rootDir>/test/custom-resolver.cjs',
    collectCoverage: true,
    extensionsToTreatAsEsm: ['.jsx', '.ts', '.tsx'],
    moduleNameMapper: {
        '#cherry-soda': '<rootDir>/src/index.ts',
        '#server/express': '<rootDir>/src/server/express.js',
        '#server/bun': '<rootDir>/src/server/bun.ts',
        '#compiler': '<rootDir>/src/compiler/node.app.js',
        '#node:compiler': '<rootDir>/lib/compiler.js',
        '#asset-compiler': '<rootDir>/src/compiler/assets.js',
        '#node:asset-compiler': '<rootDir>/lib/asset-compiler.js',
        '#render-function': '<rootDir>/src/server/render.js',
        '#node:render-function': '<rootDir>/lib/render-function.js',
        '#render-element': '<rootDir>/src/jsx/dom/render.tsx',
        '#ansi-styles': '<rootDir>/node_modules/chalk/source/vendor/ansi-styles/index.js',
        '#supports-color': '<rootDir>/node_modules/chalk/source/vendor/supports-color/index.js'
    },
    globalTeardown: '<rootDir>/test/global-teardown.js',
}
