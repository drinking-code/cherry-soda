import {unsafeInsertHtmlDoNotUse} from '../../insert-html'

export default function Html({...props}: JSX.IntrinsicElements['html']) {
    return <>
        {unsafeInsertHtmlDoNotUse('<!DOCTYPE html>')}
        <html {...props}>{props.children}</html>
    </>
}
