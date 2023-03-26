import {Html, Head, Body} from '#cherry-soda'

export default function Document({children}) {
    return (
        <Html lang={'en'}>
            <Head/>
            <Body>
                {children}
            </Body>
        </Html>
    )
}
