import browserslist from 'browserslist'
import stylePlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'

import {mergeDeep, isObject, cloneDeep} from '../../utils/object.js'
import cleanUpPlugin from './plugins/CleanUpPlugin.js'

export const isProduction = process.env.BUN_ENV === 'production'
export const entryPoint = process.env.CHERRY_COLA_ENTRY

const browserslistEsbuildMap = {
    'chrome': 'chrome',
    'edge': 'edge',
    'firefox': 'firefox',
    // 'ie': 'ie',
    'ios_saf': 'ios',
    // 'opera': 'opera',
    'safari': 'safari',
}

const baseConfig = {
    target: browserslist('> 1%, not dead') // todo: make a changeable option
        .map(browser => {
            browser = browser.split(' ')
            const browserName = browserslistEsbuildMap[browser[0]]
            if (!browserName) return false
            const browserVersion = browser[1].match(/^\d+(\.\d+)?/)[0]
            return [browserName, browserVersion].join('')
        })
        .filter(v => v),
    bundle: true,
    sourcemap: !isProduction && 'inline',
    plugins: [
        stylePlugin({
            postcss: {
                plugins: [autoprefixer],
            }
        }),
        cleanUpPlugin,
    ],
}

/**
 * @param {import('esbuild').BuildOptions} config
 * */
export function extendBaseConfig(config) {
    if (!isObject(baseConfig) || !isObject(config)) return

    const baseConfigCopy = cloneDeep(baseConfig)
    mergeDeep(baseConfigCopy, config)

    return baseConfigCopy
}

export {baseConfig}
