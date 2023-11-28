export default class TreeMap<Node, ChildrenTree extends TreeMap<Node, ChildrenTree>> extends Map<Node, ChildrenTree> {
    indices: Map<Node, number> = new Map()
    nodesInOrder: Node[]

    constructor() {
        super()
        this.nodesInOrder = []
    }

    hasOnAnyLevel(node: Node): boolean {
        if (this.has(node)) return true
        for (const childTree of this.values()) {
            if (childTree.hasOnAnyLevel(node)) return true
        }
        return false
    }

    getFromAnyLevel(node: Node): ChildrenTree {
        if (this.has(node)) return this.get(node)
        for (const childTree of this.values()) {
            const returnValue = childTree.getFromAnyLevel(node)
            if (returnValue) return returnValue
        }
        return undefined
    }

    appendChildToNode(node: Node, childToBe: Node) {
        if (this.has(node)) {
            this.get(node).appendChild(childToBe)
            return true
        } else for (const childTree of this.values()) {
            if (childTree.appendChildToNode(node, childToBe)) return true
        }
        return false
    }

    appendChild(childToBe: Node) {
        const index = this.size
        this.set(childToBe, new TreeMap() as ChildrenTree)
        this.indices.set(childToBe, index)
        this.nodesInOrder[index] = childToBe
    }

    getPath(node: Node) {
        if (this.has(node)) {
            return [this.indices.get(node)]
        } else for (const [child, childTree] of this.entries()) {
            const pathInChild = childTree.getPath(node)
            if (pathInChild) {
                pathInChild.unshift(this.indices.get(child))
                return pathInChild
            }
        }
        return null
    }

    getByPath(path: number[]) {
        const index = path.shift()
        const node = this.nodesInOrder[index]
        if (path.length > 0) {
            return this.get(node)?.getByPath(path)
        } else {
            return node
        }
    }
}
