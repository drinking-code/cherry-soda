import {BunPlugin} from 'bun'

export default function jsxPatchPlugin(): Parameters<BunPlugin>[0] {
    return {
        name: 'jsx-patch-plugin',
        setup(builder) {
            // @ts-ignore Type 'Promise<{ contents: string; loader: "js"; }>' is not assignable to type 'OnLoadResult'.
            builder.onLoad({filter: /\.[tj]sx$/}, async args => {
                const entryContents = Bun.file(args.path)
                const result = transformTsx(await entryContents.text())
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

const tsconfig = Bun.file('./tsconfig.json')
const transpiler = new Bun.Transpiler({
    loader: 'tsx',
    autoImportJSX: true,
    platform: 'node',
    tsconfig: await tsconfig.text()
})

export function transformTsx(contents) {
    return transpiler.transformSync(contents, 'tsx')
}
