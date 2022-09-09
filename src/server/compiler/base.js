import browserslist from 'browserslist'

import GetChangedFilesPlugin from './GetChangedFilesPlugin.js'
import {mergeDeep, isObject, cloneDeep} from '../../utils/object.js'
import postCssPlugin from '@deanc/esbuild-plugin-postcss'
import autoprefixer from 'autoprefixer'
import {imageLoader} from '../../imports/images.js'

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
    sourcemap: 'inline',
    external: ['bun', 'fs', 'crypto'],
    plugins: [
        imageLoader
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
