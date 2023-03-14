import {Scope} from '@babel/traverse'

import Parser from '../parser'
import {transformTsx} from '../../imports/jsx-patch-plugin'

const cache: { [filename: string]: Map<Scope, number> } = {}

export default function getComponentHashFromScope(scope: Scope, parser: Parser, fileName: string): number {
    if (fileName in cache && cache[fileName].has(scope))
        return cache[fileName].get(scope)
    const block = scope.block
    const fileLines = parser.files[fileName].split("\n")
    const componentLines = fileLines.slice(block.loc.start.line - 1, block.loc.end.line)
    componentLines[0] = componentLines[0].slice(block.loc.start.column)
    const lastLineIndex = componentLines.length - 1
    componentLines[lastLineIndex] = componentLines[lastLineIndex].slice(0, block.loc.end.column)
    const functionString = componentLines.join("\n")
    const hash = Bun.hash(transformTsx(functionString).split("\n").slice(4).join("\n").trim()) as number
    if (!(fileName in cache)){
        cache[fileName] = new Map()
    }
    cache[fileName].set(scope, hash)
    return hash
}
