import ora from 'ora'

class Console {
    currentSpinner

    /**
     * @param {string|import('ora').Options} options
     * */
    spinner(options) {
        this.currentSpinner = ora(options)
        return this.currentSpinner
    }

    log(...args) {
        this.currentSpinner?.clear()
        console.log(...args)
        this.currentSpinner?.render()
    }

    error(...args) {
        this.currentSpinner?.clear()
        console.error(...args)
        this.currentSpinner?.render()
    }
}

const newConsole = new Console()

export default newConsole

/*
* spinner.clear()
* console.log('doing stuff')
* spinner.render()
* */
