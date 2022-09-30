if (!process.send) {
    throw new Error('`renderer.js` cannot be run directly')
}

const serverOutputPath = process.argv[2]
const App = (await import(`${serverOutputPath}/App.mjs`)).main
const render = (await import('#render-element')).default

global['cherry-cola'] = {}
process.on('message', message => {
    if (message.type === 'instruction') {
        if (message.do === 'render') {
            const rendered = render(App())
            process.send({
                type: 'response',
                content: rendered,
            })
        }
    }
})
