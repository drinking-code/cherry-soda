import isState from '../../../state/is-state.js'

export default function Body({content, ...props}) {
    const stateMappingString = stringifyStateMapping(global['stateTemplates'])
    global['stateTemplates'].clear()
    if (content) {
        content += `<script type="application/json">${stateMappingString}</script>`
        return <body {...props} unsafeInnerHtml={content}/>
    }
    return (
        <body {...props}>
        {props.children}
        <script type={'application/json'}>{stateMappingString}</script>
        </body>
    )
}

function stringifyStateMapping(stateMapping) {
    function convertStates(content) {
        return content.map(entry => {
            if (isState(entry)) {
                entry = {state: entry.$$stateId.serialize()}
            }
            return entry
        })
    }

    const stateMappingEntries = Array.from(stateMapping.entries())
        .map(([stateId, stateUses]) => [
            stateId,
            Array.from(stateUses.values())
                .map(stateUse => {
                    stateUse.content = convertStates(stateUse.content)
                    return stateUse
                })
        ])

    return JSON.stringify(Object.fromEntries(stateMappingEntries))
}
