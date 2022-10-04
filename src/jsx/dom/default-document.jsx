import {Html, Head, Body} from '#cherry-cola'

export default function Document({...props}) {
    return (
        <Html lang={'en'}>
            <Head/>
            {props.children.length === 1 && typeof props.children[0] === 'string'
                ? <Body content={props.children[0]}/>
                : <Body>
                    {props.children}
                </Body>
            }
        </Html>
    )
}
