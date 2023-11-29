import State, {isState, StateConcatenation} from './State'
import {Fragment, RenderHookChildCallback, RenderHookMatcher, RenderHookPropCallback} from '@cherry-soda/core'
import {registerRenderHook} from '@cherry-soda/core'
import StateConsumer, {isStateConsumer} from './StateConsumer'

type RenderableState = State | StateConcatenation | StateConsumer

const isRenderableState: RenderHookMatcher = (child): child is RenderableState => isState(child) || isStateConsumer(child)

const renderChild: RenderHookChildCallback<RenderableState> = (child, render) => {
    const stateConsumer = isState(child) ? child.use() : child
    const result = stateConsumer.render()

    const renderedChild = render(result)

    // because fragment node cannot be tracked as a dom element, the children are tracked, and fragment becomes the parent
    let parentNode = renderedChild.type === Fragment ? renderedChild : renderedChild._parent
    let nodes = renderedChild.type === Fragment
        ? renderedChild._fragmentChildren
        : [renderedChild._dom as HTMLElement]

    if (Array.isArray(stateConsumer.states)) {
        stateConsumer.states.forEach(state => state._tieNodeChild(parentNode, stateConsumer, render, nodes))
    } else {
        stateConsumer.states._tieNodeChild(parentNode, stateConsumer, render, nodes)
    }
}

const renderProp: RenderHookPropCallback<RenderableState> = (value, setProp, {node, key}) => {
    const stateConsumer = isState(value) ? value.use() : value
    const result = stateConsumer.render()
    setProp(String(result))

    if (Array.isArray(stateConsumer.states)) {
        stateConsumer.states.forEach(state => state._tieNodeProp(node, stateConsumer, key))
    } else {
        stateConsumer.states._tieNodeProp(node, stateConsumer, key)
    }
}

registerRenderHook(isRenderableState, renderChild, renderProp)
