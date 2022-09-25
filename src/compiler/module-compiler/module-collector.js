import {default as iposPromise} from '../../ipos.js'
import {VirtualElement} from '../../jsx/VirtualElement.js'

const ipos = await iposPromise

const serverOutputPath = process.argv[2]
const App = (await import(`${serverOutputPath}/App.js`)).main
let moduleCollector = {}

function collectModules(element, isFirstCall = false) {
    if (isFirstCall)
        moduleCollector.currentFile = process.env.CHERRY_COLA_ENTRY

    const functionComponentsFile =
        ipos.importTrees
            .map(tree => tree.find(moduleCollector.currentFile))
            .filter(v => v)[0]
            ?.imports
            .find(imp => Array.from(Object.values(imp.specifiers))
                .includes(element.function.name)
            )
            ?.fileTree

    moduleCollector.parentFile = moduleCollector.currentFile
    moduleCollector.currentFile = functionComponentsFile?.filename

    const virtualElement = element
        .function({...element.props, children: element.children})

    if (isFirstCall)
        closeModuleBuilder()

    virtualElement.children
        .flat()
        .filter(v => v)
        .forEach((child) => {
            if (!child instanceof VirtualElement) return
            collectModules(element)
        })
}

collectModules(App, true)
