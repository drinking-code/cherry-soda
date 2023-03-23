import {BunPlugin} from 'bun'

import sass from 'sass'
import postcss from 'postcss'
import PostcssModulesPlugin from 'postcss-modules'
import generateClassName from '../utils/generate-css-class-name'

export default function bunStylePlugin(): Parameters<BunPlugin>[0] {
    return {
        name: 'bun-style-plugin',
        setup(builder) {
            builder.onLoad({filter: /\.module\.s?[ac]ss$/}, async args => {
                const sassResult = sass.compile(args.path) // todo: this right here tanks startup performance
                let cssModulesJson
                await postcss([
                    PostcssModulesPlugin({
                        getJSON: (cssFileName, json) => cssModulesJson = json,
                        scopeBehaviour: 'local',
                        generateScopedName: (name, filename) =>
                            generateClassName(name, filename),
                    })
                ])
                    .process(sassResult.css, {from: args.path, to: undefined})
                    .then()
                return {
                    contents: `export default ${JSON.stringify(cssModulesJson)}`,
                    loader: 'js'
                }
            })
        }
    }
}
