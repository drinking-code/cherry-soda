import GetChangedFilesPlugin from './GetChangedFilesPlugin.js'
import {mergeDeep, isObject, cloneDeep} from '../../utils/object.js'

export const isProduction = process.env.BUN_ENV === 'production'
const entryPoint = process.env.CHERRY_COLA_ENTRY

const baseConfig = {
    mode: isProduction ? 'production' : 'development',
    entry: entryPoint,
    devtool: !isProduction && 'inline-source-map',
    output: {
        filename: '[name].mjs',
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
                            importSource: '/../src',
                        }]
                    ]
                }
            }
        },],
    },
}

/**
 * @param {import('webpack/types').Configuration} config
 * */
export function extendBaseConfig(config) {
    if (!isObject(baseConfig) || !isObject(config)) return

    const baseConfigCopy = cloneDeep(baseConfig)
    mergeDeep(baseConfigCopy, config)

    return baseConfigCopy
}

export {baseConfig}
