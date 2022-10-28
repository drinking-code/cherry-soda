let bunTest
if (typeof Bun !== 'undefined')
    bunTest = await import('bun:test')
const describeExport: typeof describe = bunTest?.describe ?? describe
const testExport: typeof test = bunTest?.test ?? test
const expectExport: typeof expect = bunTest?.expect ?? expect

export {describeExport as describe, testExport as test, expectExport as expect}
