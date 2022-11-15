import path from 'path'
import fs from 'fs'

import {getStatesFrontendFileName} from './states-frontend-files'

export default async function compileAssets(initialValuesKey) {
    // compile modules.js into the final fe-js (for the next test)
    const assetCompilerModule = await import('#node:asset-compiler')
    const {
        endEventTarget: assetCompilerEndEventTarget,
        outputPath: assetCompilerOutputPath,
    } = assetCompilerModule
    const stopAssetsCompiler = assetCompilerModule.stopAssetsCompiler

    await new Promise<void>(resolve => {
        assetCompilerEndEventTarget.addEventListener('end', () => resolve(), {once: true})
    })
    // copy the generated file, because the next iteration of this test will override it
    await fs.promises.cp(
        path.join(assetCompilerOutputPath, 'main.js'),
        getStatesFrontendFileName(initialValuesKey)
    )

    return stopAssetsCompiler
}
