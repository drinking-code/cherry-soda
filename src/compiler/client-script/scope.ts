import {Identifier, Statement} from '@babel/types'
import {ImportDataType} from './extract-function'

export class Scope {
    data: Map<Identifier, Array<Statement>> = new Map()
    imports: { [filePath: string]: { [localName: string]: string | typeof Scope.importAll | typeof Scope.defaultImport } } = {}
    order: [Identifier, number][] = []

    static idMatch(idA: Identifier, idB: Identifier) {
        return idA?.name === idB?.name
    }

    static defaultImport = Symbol.for('defaultImport')
    static importAll = Symbol.for('namespace')

    ensureKey(id: Identifier) {
        if (this.has(id)) return
        this.data.set(id, [])
    }

    has(id: Identifier) {
        for (const currentId of this.data.keys()) {
            if (Scope.idMatch(id, currentId))
                return true
        }
        return false
    }

    hasImport(identifier: string) {
        for (const iDontKnowWhatToNameThis of Object.values(this.imports)) {
            if (Array.from(Object.keys(iDontKnowWhatToNameThis)).includes(identifier))
                return true
        }
        return false
    }

    add(id: Identifier, value: Statement) {
        this.ensureKey(id)
        this.order.push([id, this.data.get(id).length])
        this.data.get(id).push(value)
    }

    addImport(localName: string, importName: string | typeof Scope.importAll | typeof Scope.defaultImport, fileName) {
        if (!this.imports[fileName])
            this.imports[fileName] = {}
        this.imports[fileName][localName] = importName
    }

    get(id: Identifier) {
        return this.data.get(id)
    }

    getId(id: string) {
        for (const currentId of this.data.keys()) {
            if (currentId.name === id)
                return currentId
        }
    }

    getOrder(id: Identifier) {
        const index = this.order.findIndex(([currentId]) => Scope.idMatch(id, currentId))
        return index * 1e3 + this.order[index][1]
    }

    getImport(localName: string): ImportDataType {
        for (const filePath of Object.keys(this.imports)) {
            if (localName in this.imports[filePath])
                return {
                    importName: this.imports[filePath][localName],
                    localName, filePath
                }
        }
    }
}
