import path from 'path'
import fs from 'fs'

import testDir from '../temp-dir'

export function getStatesFrontendFileName(key) {
    return path.join(testDir, `state.${key}.fe.js`)
}

export function waitForStatesFrontendFile(key) {
    const path = getStatesFrontendFileName(key)
    return new Promise(resolve => {
        const waitForFileInterval = setInterval(() => {
            if (!fs.existsSync(path)) return
            clearInterval(waitForFileInterval)
            resolve()
        })
    })
}
