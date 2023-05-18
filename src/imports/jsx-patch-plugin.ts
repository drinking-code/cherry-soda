import {BunPlugin} from 'bun'
import fs from 'fs'

import {resolve as resolveProjectRoot} from '../utils/project-root'

export default function jsxPatchPlugin(): Parameters<BunPlugin>[0] {
    return {
        name: 'jsx-patch-plugin',
        setup(builder) {
            // @ts-ignore Type 'Promise<{ contents: string; loader: "js"; }>' is not assignable to type 'OnLoadResult'.
            builder.onLoad({filter: /\.[tj]sx$/}, args => {
                const entryContents = fs.readFileSync(args.path, 'utf8')
                const result = transformTsx(entryContents)
                    .replace(/from ?['"]react['"];?$/gm, 'from "cherry-soda/jsx-runtime";')
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

const tsconfig = fs.existsSync(resolveProjectRoot('./tsconfig.json'))
    ? fs.readFileSync(resolveProjectRoot('./tsconfig.json'), 'utf8')
    : fs.readFileSync(resolveProjectRoot('./jsconfig.json'), 'utf8')
export const transpiler = new Bun.Transpiler({
    loader: 'tsx',
    autoImportJSX: true,
    platform: 'node',
    tsconfig
})

export function transformTsx(contents) {
    return transpiler.transformSync(contents, 'tsx')
}
