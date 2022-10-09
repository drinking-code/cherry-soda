import IPOS from 'ipos'
import FileTree, {Import} from './compiler/helpers/FileTree.ts'
import {VirtualRenderedElement} from './compiler/module-compiler/VirtualRenderedElement.js'

IPOS.registerClass(FileTree)
IPOS.registerClass(Import)
IPOS.registerClass(VirtualRenderedElement)

if (!global.ipos)
    global.ipos = IPOS.new()

export default global.ipos
