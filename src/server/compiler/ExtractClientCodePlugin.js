export default function extractClientCodePlugin() {
    return {
        name: 'extract-client-code-plugin',
        async setup(build) {
            build.onLoad({filter: /\.[jt]sx?$/}, async (args) => {
                return {
                    contents: JSON.stringify(),
                    loader: 'json',
                }
            })
        },
    }
}
