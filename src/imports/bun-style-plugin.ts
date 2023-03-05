import {BunPlugin} from 'bun'

import sass from 'sass'
import postcss from 'postcss'
import PostcssModulesPlugin from 'postcss-modules'

export default function bunStylePlugin(): Parameters<BunPlugin>[0] {
    return {
        name: 'bun-style-plugin',
        setup(builder) {
            builder.onLoad({filter: /\.module\.s?[ac]ss$/}, async args => {
                const sassResult = sass.compile(args.path)
                let cssModulesJson
                await postcss([
                    PostcssModulesPlugin({
                        getJSON: (cssFileName, json) => cssModulesJson = json
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
