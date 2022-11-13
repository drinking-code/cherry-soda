import {default as iposPromise} from '../../ipos'
import {addImports} from './imports'
import {generateId} from '../../state/state-id'

const ipos = await iposPromise

export default function importOnClient(module: string) {
    const dataStore = ipos.moduleCollector
    let id = generateId()
    if (/^\d+/.test(id))
        id = id.substring(1, id.length)
    addImports(dataStore.currentFile, {[module]: {'Symbol(default-import)': 'import_' + id}}, false)
    // todo: resolve relative paths
    return new ClientSideModule(module, id)
}

export function isClientSideModule(value): value is ClientSideModule {
    return value?.constructor.name === ClientSideModule.name
}

export class ClientSideModule {
    private readonly _modulePath: string
    private readonly _id: string

    constructor(modulePath, id) {
        this._modulePath = modulePath
        this._id = id
    }

    get modulePath() {
        return this._modulePath
    }

    stringify(): string {
        return 'import_' + this._id
    }
}
