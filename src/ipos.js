import IPOS from 'ipos'
import FileTree, {Import} from './compiler/helpers/FileTree.ts'

IPOS.registerClass(FileTree)
IPOS.registerClass(Import)

if (!global.ipos)
    global.ipos = IPOS.new()

export default global.ipos
