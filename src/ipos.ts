import IPOS from 'ipos'
import FileTree, {Import} from './compiler/helpers/FileTree'
import {VirtualRenderedElement} from './compiler/module-compiler/VirtualRenderedElement'

IPOS.registerClass(FileTree)
IPOS.registerClass(Import)
IPOS.registerClass(VirtualRenderedElement)
IPOS.registerClass(
    // @ts-ignore typescript doesn't know that node has CustomEvent
    CustomEvent,
    (ce: Event & { detail: any }) => {
        return {
            type: ce.type,
            detail: ce.detail,
        }
    }, data => {
        // @ts-ignore typescript doesn't know that node has CustomEvent
        return new CustomEvent(data.type, {detail: data.detail})
    }
)


if (!global.ipos)
    global.ipos = IPOS.new()

export default global.ipos
