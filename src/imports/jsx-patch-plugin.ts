import {BunPlugin} from 'bun'

export default function jsxPatchPlugin(): Parameters<BunPlugin>[0] {
    return {
        name: 'jsx-patch-plugin',
        setup(builder) {
            builder.onLoad({filter: /[tj]sx$/}, async args => {
                const tsconfig = Bun.file('./tsconfig.json')
                const transpiler = new Bun.Transpiler({
                    loader: 'tsx',
                    autoImportJSX: true,
                    platform: 'node',
                    tsconfig: await tsconfig.text()
                })
                const entryContents = Bun.file(args.path)
                const result = transpiler.transformSync(await entryContents.text(), 'tsx')
                    .replace(/^import ?\* ?as ?[^ ]+ ?from ?['"]react['"];?$/gm, '')
                    .replace(/^var JSXClassic ?= ?require\([^ )]+\);?$/gm, 'var JSXClassic = JSX;')
                return {
                    contents: result,
                    loader: 'js'
                }
            })
        }
    }
}
