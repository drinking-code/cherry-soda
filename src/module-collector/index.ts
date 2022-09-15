import {VirtualElement} from '../jsx/VirtualElement'
import {Body, Head, Html} from '../index'
import Document from '../dom/default-document'



export default function callFunctionComponent(element: VirtualElement) {
    // @ts-ignore "Function" does not match "({ ...props }: { [x: string]: any; }) => any"
    console.log([Html, Document, Head, Body].includes(element.function))
    // console.log(global['cherry-cola'].importTrees)
    console.log(element.function.name)
    return element
        .function({...element.props, children: element.children})
        .render(0, element.id)
}
