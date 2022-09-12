if (!process.send) {
    throw new Error('`renderer.js` cannot be run directly')
}

const serverOutputPath = process.argv[2]
const App = (await import(`${serverOutputPath}/App.js`)).main
const {render} = await import(`${serverOutputPath}/cherry-cola.js`)

;(async () => {
    global['cherry-cola'] = {}
    process.on('message', message => {
        try {
            message = JSON.parse(message)
        } catch (e) {
            // fail silently
        }

        if (message.type === 'instruction') {
            if (message.do === 'render') {
                process.send(JSON.stringify({
                    type: 'response',
                    content: render(App()),
                }))
            }
        } else if (message.type === 'variable') {
            global['cherry-cola'][message.key] = message.value
        }
    })
})()
