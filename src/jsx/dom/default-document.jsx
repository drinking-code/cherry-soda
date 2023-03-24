import {Html, Head, Body} from '#cherry-soda'

export default function Document({clientAssets, ...props}) {
    return (
        <Html lang={'en'}>
            <Head clientAssets={clientAssets}/>
            <Body>
                {props.children}
            </Body>
        </Html>
    )
}
