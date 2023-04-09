import fs from 'fs'

export function watch(filename: string, listener: (eventType: string, filename: string) => void) {
    let mtimeMs = fs.statSync(filename).mtimeMs
    setInterval(() => {
        const newMtimeMs = fs.statSync(filename).mtimeMs
        if (mtimeMs === newMtimeMs) return
        mtimeMs = newMtimeMs
        listener('', filename)
    }, 100)
}
