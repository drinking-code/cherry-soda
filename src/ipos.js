import IPOS from 'ipos'
import FileTree, {Import} from './compiler/helpers/FileTree.js'

IPOS.registerClass(FileTree)
IPOS.registerClass(Import)

if (!global.ipos)
    global.ipos = IPOS.new()

export default global.ipos
