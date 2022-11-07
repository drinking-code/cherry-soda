import FileTree from '../helpers/FileTree'
import {addModule} from './index'
import console from '../../utils/console'
import {default as iposPromise} from '../../ipos'
import {State, StateType} from '../../state'
import {Ref} from '../../jsx/create-ref'

let trees: Array<FileTree> | undefined

const ipos = await iposPromise

type DependencyType =
    StateType |
    Ref |
    any

type UnwrapState<T extends State<any>> = T extends State<infer U> ? U : never;

type MappedDependencyType<Dep> =
    Dep extends Ref
        // todo: return specific element type (e.g. ButtonElement)
        // @ts-ignore Cannot find name 'HTMLElement'.
        ? HTMLElement : (
            Dep extends StateType
                ? [Mutable<UnwrapState<Dep>>, (newValue: any) => void]
                : Dep
            )

type MappedDependenciesType<Deps> = {
    [K in keyof Deps]: MappedDependencyType<Deps[K]>
} & {
    // @ts-ignore
    length: Deps['length']
} & any[]

export default function doSomething<Deps = DependencyType[]>(callback: (...args: MappedDependenciesType<Deps>) => void | Function, dependencies: Deps): void {
    if (!ipos.moduleCollector) return
    trees = trees ?? ipos.importTrees
    const dataStore = ipos.moduleCollector

    const currentFile: FileTree | void = trees
        .map(tree => tree.find(dataStore.currentFile))
        .filter(v => v)[0]

    if (!currentFile)
        throw new Error() // todo
    addModule(callback.toString(), dependencies as unknown as Array<any>, currentFile.filename)
}
