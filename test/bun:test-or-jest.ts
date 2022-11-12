let testModule
if (typeof Bun !== 'undefined')
    testModule = await import('bun:test')
else
    testModule = await import('@jest/globals')
const describe: typeof import('@jest/globals').describe = testModule.describe
const test: typeof import('@jest/globals').test = testModule.test
const expect: typeof import('@jest/globals').expect = testModule.expect

export {describe, test, expect}
