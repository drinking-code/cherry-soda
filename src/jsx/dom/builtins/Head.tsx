import State from '../../../state/state'
import {Volume} from 'memfs/lib/volume'
import Bundle from './Bundle'

export default function Head({children, ...props}: JSX.IntrinsicElements['head']) {
    const charset = children.find(<meta charSet/>) ?? <meta charSet={'utf-8'}/>
    delete children[children.indexOf(charset)]
    const title = children.find(<title/>) ?? <title>Title</title>
    delete children[children.indexOf(title)]

    return (
        <head {...props}>
            {charset}
            {title}
            {children}
            <Bundle/>
            {/* todo: preload important non-code assets */}
        </head>
    )
}
