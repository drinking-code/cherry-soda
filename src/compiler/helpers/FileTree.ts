export interface SerializedImportType {
    fileTree: SerializedFileTreeType
    specifiers: SpecifiersType
}

export interface SpecifiersType {
    [importedName: string]: string
}

export class Import {
    // file tree of file imported
    fileTree: FileTree
    specifiers: SpecifiersType = {}

    constructor(filename: string | FileTree, specifiers: SpecifiersType) {
        if (filename instanceof FileTree)
            this.fileTree = filename
        else
            this.fileTree = new FileTree(filename)
        this.specifiers = specifiers
    }

    serialize(): SerializedImportType {
        return {
            fileTree: this.fileTree.serialize(),
            specifiers: this.specifiers,
        }
    }

    static from(object: SerializedImportType): Import {
        return new Import(
            FileTree.from(object.fileTree),
            object.specifiers,
        )
    }
}

export interface SerializedFileTreeType {
    filename: string
    imports: Array<SerializedImportType>
}

export default class FileTree {
    // the absolute path to the file
    filename: string
    // array of FileTree
    imports: Array<Import> = []

    constructor(filename: string, imports?: Array<Import>) {
        this.filename = filename
        this.imports = imports ?? []
    }

    has(filename: string): boolean {
        if (this.filename === filename) {
            return true
        } else {
            return this.imports
                .map(imp => imp.fileTree.has(filename))
                .includes(true)
        }
    }

    find(filename: string, level: number = 0): FileTree | void {
        if (this.filename === filename) {
            return this
        } else {
            return this.imports
                .map(imp => imp.fileTree.find(filename, level + 1))
                .filter(v => v)[0]
        }
    }

    addImportsTo(source: string, targets: Array<Import>) {
        if (this.filename !== source)
            this.imports
                .forEach(imp => imp.fileTree.addImportsTo(source, targets))
        else
            this.imports.push(...targets)
    }

    get relativePath(): string {
        return this.filename?.replace(process.env.APP_ROOT_PATH, '')
    }

    print(console1: any = console, level: number = 0, isLast: boolean = false): void {
        console1.log(
            Array(Math.max(level - 1, 0)).fill('  ') +
            (level !== 0 ? (
                isLast ? '└╴' : '├╴'
            ) : '') +
            this.relativePath
        )
        this.imports.forEach((imp, i) => {
            imp.fileTree.print(console1, level + 1, this.imports.length - 1 === i)
        })
    }

    serialize(): SerializedFileTreeType {
        return {
            filename: this.filename,
            imports: this.imports.map(imp => imp.serialize()),
        }
    }

    static from(object: SerializedFileTreeType): FileTree {
        return new FileTree(
            object.filename,
            object.imports.map(imp => Import.from(imp))
        )
    }
}
