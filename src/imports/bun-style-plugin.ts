import {BunPlugin} from 'bun'
import path from 'path'

import getNames from 'css-modules-extractor'

import generateClassName from '../utils/generate-css-class-name'
import {addMarker} from '../compiler/profiler'

export default function bunStylePlugin(): Parameters<BunPlugin>[0] {
    return {
        name: 'bun-style-plugin',
        setup(builder) {
            builder.onLoad({filter: /\.module\.s?[ac]ss$/}, async args => {
                addMarker('template', `parse-style-${path.basename(args.path)}-start`)
                const cssModulesJson = getNames(args.path, {
                    // scopeBehaviour: 'local',
                    generateScopedName: (name, filename) =>
                        generateClassName(name, filename),
                })
                addMarker('template', `parse-style-${path.basename(args.path)}-end`)
                return {
                    exports: {default: cssModulesJson},
                    loader: 'object'
                }
            })

            builder.onLoad({filter: /\.s?[ac]ss$/}, async args => {
                return {
                    contents: '',
                    loader: 'js'
                }
            })
        }
    }
}
