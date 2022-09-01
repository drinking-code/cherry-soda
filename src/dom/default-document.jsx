import {Html, Head, Body} from '../';

export default function Document({...props}) {
    return (
        <Html lang={'en'}>
        <Head/>
        <Body>
        {props.children}
        </Body>
        </Html>
    )
}
