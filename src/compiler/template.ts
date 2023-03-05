// render components to retrieve templates for them
// a template is the returned tree (where other components are references)
// a template may include a state somewhere (plain, or convoluted)

import '../imports/'

export type ComponentTemplateType = {}

export default async function extractTemplates(entry: string) {
    const templates: Map<number, ComponentTemplateType> = new Map()
    const component = (await import(entry)).main

    function extractTemplateFromComponent(component: (...props: any[]) => JSX.Element) {

    }

    const hash = Bun.hash(component.toString())
    console.log(hash, component.toString())
    const returnValue = component()
    console.log(returnValue)
}
