import VNode from '../jsx/VNode'
import StateConsumer from '../state/StateConsumer'

export function updateNodeChild(node: VNode, childIndex: number, consumer: StateConsumer) {
    const nodeToReplace = node._dom.childNodes[childIndex]
    const result = consumer.render()
    if (result instanceof VNode) {
        // todo
    } else {
        nodeToReplace.replaceWith(String(result))
    }
}

export function updateNodeProp(node: VNode, prop: string, consumer: StateConsumer) {
    const result = consumer.render()
    const value = result instanceof VNode ? result : String(result)
    node._dom.setAttribute(prop, value as any)
}
