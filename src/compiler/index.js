import {outputPath as assetsOutputPath} from '../compiler/assets.js'

let serverFilePath
if (typeof Bun === 'undefined') {
    const nodeCompiler = await import('../compiler/node.js')
    serverFilePath = nodeCompiler.outputPath
} else {
    // todo
}

export {assetsOutputPath, serverFilePath}
