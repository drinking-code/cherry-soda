const path = require('path')

module.exports = function (modulePath, options) {
    if (modulePath === 'src/jsx-runtime') {
        return path.resolve('./lib/jsx-runtime.cjs')
    }
    return options.defaultResolver(modulePath, options)
}
