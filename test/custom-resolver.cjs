const path = require('path')

module.exports = function (modulePath, options) {
    if (modulePath === 'src/jsx-runtime') {
        return path.resolve('./src/jsx-runtime.ts')
    }
    return options.defaultResolver(modulePath, options)
}
