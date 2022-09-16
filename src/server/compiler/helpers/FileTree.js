export class Import {
    // file tree of file imported
    fileTree;
    specifiers = {};

    constructor(filename, specifiers) {
        if (filename instanceof FileTree)
            this.fileTree = filename
        else
            this.fileTree = new FileTree(filename)
        this.specifiers = specifiers
    }

    static fromObject(object) {
        return new Import(
            FileTree.fromObject(object.fileTree),
            object.specifiers,
        )
    }
}

export default class FileTree {
    // the absolute path to the file
    filename;
    // array of FileTree
    imports = [];

    /**
     * @param {string} filename
     * @param {Array<Import>} [imports]
     * */
    constructor(filename, imports) {
        this.filename = filename
        this.imports = imports ?? []
    }

    has(filename) {
        if (this.filename === filename) {
            return true
        } else {
            return this.imports
                .map(imp => imp.fileTree.has(filename))
                .includes(true)
        }
    }

    find(filename, level = 0) {
        if (this.filename === filename) {
            return this
        } else {
            return this.imports
                .map(imp => imp.fileTree.find(filename, level + 1))
                .filter(v => v)[0]
        }
    }

    /**
     * @param {string} source
     * @param {Array<Import>} targets
     * */
    addImportsTo(source, targets) {
        if (this.filename !== source)
            this.imports
                .forEach(imp => imp.fileTree.addImportsTo(source, targets))
        else
            this.imports.push(...targets)
    }

    get relativePath() {
        return this.filename?.replace(process.env.APP_ROOT_PATH, '')
    }

    print(console = console, level = 0, isLast = false) {
        console.log(
            Array(Math.max(level - 1, 0)).fill('  ') +
            (level !== 0 ? (
                isLast ? '└╴' : '├╴'
            ) : '') +
            this.relativePath
        )
        this.imports.forEach((imp, i) => {
            imp.fileTree.print(console, level + 1, this.imports.length - 1 === i)
        })
    }

    static fromObject(object) {
        return new FileTree(
            object.filename,
            object.imports.map(imp => Import.fromObject(imp))
        )
    }
}
