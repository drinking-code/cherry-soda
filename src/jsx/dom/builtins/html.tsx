export default function Html({...props}: JSX.IntrinsicElements['html']) {
    return <>
        {'<!DOCTYPE html>'}
        <html {...props}>{props.children}</html>
    </>
}
