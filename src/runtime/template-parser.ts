import {makeError, messages as errors} from '../messages/errors'

type ParserMetadataType<T extends boolean = boolean> = {
    phase: 0 | 1 | 2
    isText: T
    text: T extends true ? string : never | null
    tagName: T extends false ? string : never | null
    parent: HTMLElement
}

export class TemplateParser {
    template: string[]
    #charEscaped: string | false = false
    #meta: ParserMetadataType = {
        phase: null,
        isText: false,
        text: null,
        tagName: null,
        parent: null,
    }
    #currentElement: null | HTMLElement | Text = null
    #currentProp: null | (null | string)[] = null
    elements: (HTMLElement | Text)[] = []

    constructor(template: string) {
        if (!template.startsWith('[')) throw makeError(errors.templateParser.invalidTemplate, [template])
        this.template = template.split('')
    }

    parseTemplate() {
        this.template.forEach(char => {
            const _t = this
            switch (char) {
                case '[':
                    if (_t.#charEscaped === '[') break // #charEscaped cancellation after switch
                    if (_t.#meta.phase === null) {
                        _t.#meta.phase = 0 // begin collecting element tag name
                        _t.#meta.tagName = ''
                    } else if (_t.#meta.phase === 0) {
                        // flush tag name
                        _t.#currentElement = document.createElement(_t.#meta.tagName)
                        _t.#meta.tagName = null
                        _t.#meta.phase = 1 // begin collecting props
                        _t.#currentProp = ['', null]
                    } else if (_t.#meta.phase === 1) {
                        _t.#meta.phase = 2 // begin building children
                        _t.#flushCurrentElement()
                        _t.#charEscaped = '['
                        _t.#meta.phase = 0 // begin collecting element tag n.ame
                        _t.#meta.tagName = ''
                        return // to circumvent the #charEscaped cancellation
                    }
                    break
                case '"':
                    if (_t.#meta.phase === 0) {
                        if (_t.#meta.isText) {
                            _t.#meta.phase = 2 // begin collecting text
                        }
                    } else if (_t.#meta.phase === 1) {
                        if (!_t.#currentProp[1]) {
                            _t.#currentProp[1] = ''
                        } else if (_t.#currentElement instanceof HTMLElement) {
                            _t.#currentElement.setAttribute(...(_t.#currentProp as [string, string]))
                            _t.#currentProp = ['', null]
                        }
                    } else if (_t.#meta.phase === 2) {
                        if (_t.#meta.isText) {
                            _t.#currentElement = document.createTextNode(_t.#meta.text)
                            _t.#meta.text = null
                            _t.#meta.isText = false
                        }
                    }
                    break
                case ']':
                    if (_t.#meta.phase === 1) {
                        _t.#currentProp = null
                    } else if (_t.#meta.phase === 2) {
                        _t.#flushCurrentElement()
                        _t.#meta.phase = null
                    } else if (_t.#meta.phase == null) {
                        _t.#meta.parent = null
                    }
                    break
                default:
                    if (_t.#meta.phase === 0) { // collecting element tag name phase
                        if (char == '0') {
                            _t.#meta.tagName = null
                            _t.#meta.text = ''
                            _t.#meta.isText = true
                        } else {
                            _t.#meta.tagName += char
                        }
                    } else if (_t.#meta.phase === 1) {
                        const index = Number(_t.#currentProp[1] != null) // this.#currentProp[1] != null ? 1 : 0
                        _t.#currentProp[index] += char
                    } else if (_t.#meta.phase === 2) {
                        if (_t.#meta.isText) {
                            _t.#meta.text += char
                        }
                    }
            }
            _t.#charEscaped = false
        })
    }

    #flushCurrentElement() {
        if (this.#meta.parent) {
            this.#meta.parent.append(this.#currentElement)
        } else {
            this.elements.push(this.#currentElement)
        }
        if (this.#currentElement instanceof HTMLElement) {
            this.#meta.parent = this.#currentElement
        }
        this.#currentElement = null
    }
}
