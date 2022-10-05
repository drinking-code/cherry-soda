import './dev.js'
export {findElement} from './find-element.js'
export {registerStateMappings, createClientState, getState} from './create-client-state'

export function execModules(modules, parameters) {
    Array.from(modules.keys()).forEach(key => {
        modules.get(key)(...parameters.get(key))
    })
}
