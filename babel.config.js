export default {
    presets: [[
        '@babel/preset-env',
        {
            modules: false,
            targets: {
                node: 'current',
            },
        },
    ], [
        '@babel/preset-typescript'
    ]],
    plugins: [[
        "@babel/plugin-syntax-jsx"
    ], [
        "@babel/plugin-transform-react-jsx",
        {
            "runtime": "automatic",
            "importSource": "src"
        }
    ]],
}
