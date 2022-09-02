export const isProduction = process.env.BUN_ENV === 'production'
const entryPoint = process.env.CHERRY_COLA_ENTRY
export const baseConfig = {
    mode: isProduction ? 'production' : 'development',
    entry: entryPoint,
    devtool: !isProduction && 'inline-source-map',
    output: {
        filename: 'main.js',
        clean: true,
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    module: {
        rules: [{
            test: /\.[jt]sx?$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-typescript'],
                    plugins: [
                        ["@babel/plugin-transform-react-jsx", {
                            runtime: 'automatic',
                            importSource: '/src',
                        }]
                    ]
                }
            }
        },],
    },
}
