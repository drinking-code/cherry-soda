import {makeError, messages as errors} from '../messages/errors'
import {ClientTemplatesMapType} from '../compiler/template/types'

type ParserMetadataType<T extends boolean = boolean> = {
    phase: 0 | 1 | 2
    isText: T
    isComponent: boolean
    text: T extends true ? string : never | null
    tagName: T extends false ? string : never | null
    parent: HTMLElement
}

type DOMElement = object
type DOMTextElement = any

export class TemplateParser {
    template: string[]
    private _charEscaped: string | false = false
    private _meta: ParserMetadataType = {
        phase: null,
        isText: false,
        isComponent: false,
        text: null,
        tagName: null,
        parent: null,
    }
    private _currentElement: null | HTMLElement | Text = null
    private _currentProp: null | (null | string)[] = null
    elements: (HTMLElement | Text)[] = []

    private readonly _createDomElement: (tagName: string) => HTMLElement = tagName => document.createElement(tagName)
    private readonly _createTextNode: (text: string) => Text = text => document.createTextNode(text)
    private readonly _isDomElement = (object: HTMLElement | Text): object is HTMLElement => object instanceof HTMLElement
    private readonly _setAttribute = (object: HTMLElement, key: string, value: string) => object.setAttribute(key, value)
    private readonly _appendElement = (parent: HTMLElement, object: HTMLElement | Text) => parent.append(object)
    private readonly _isValidTagName = (tagName: string) => tagName.match(/^[a-z-]+$/) && !(document.createElement(tagName) instanceof HTMLUnknownElement)

    constructor(template: string, domMethods: {
        createDomElement?: (tag: string) => DOMElement
        createTextNode?: (text: string) => DOMTextElement
        isDomElement?: (object: DOMElement | DOMTextElement) => boolean
        setAttribute?: (object: DOMElement, key: string, value: string) => void
        appendElement?: (parent: DOMElement, object: DOMElement | DOMTextElement) => void
    } = {}) {
        if (!template.startsWith('[')) throw makeError(errors.templateParser.invalidTemplate, [template])
        this.template = template.split('')
        if (domMethods.createDomElement)
            this._createDomElement = domMethods.createDomElement as unknown as typeof this._createDomElement
        if (domMethods.createTextNode)
            this._createTextNode = domMethods.createTextNode as unknown as typeof this._createTextNode
        if (domMethods.isDomElement)
            this._isDomElement = domMethods.isDomElement as unknown as typeof this._isDomElement
        if (domMethods.setAttribute)
            this._setAttribute = domMethods.setAttribute as unknown as typeof this._setAttribute
        if (domMethods.appendElement)
            this._appendElement = domMethods.appendElement as unknown as typeof this._appendElement
    }

    parseTemplate(templates?: ClientTemplatesMapType) {
        const _t = this
        this.template.forEach(char => {
            switch (char) {
                case '[':
                    if (_t._charEscaped === '[') break // _charEscaped cancellation after switch
                    if (_t._meta.phase === null) {
                        _t._meta.phase = 0 // begin collecting element tag name
                        _t._meta.tagName = ''
                    } else if (_t._meta.phase === 0) {
                        // flush tag name
                        if (!_t._isValidTagName(_t._meta.tagName)) {
                            _t._meta.isComponent = true
                            _t._meta.phase = 1 // begin collecting props
                            _t._currentProp = ['', null]
                        } else {
                            _t._currentElement = _t._createDomElement(_t._meta.tagName)
                            _t._meta.tagName = null
                            _t._meta.phase = 1 // begin collecting props
                            _t._currentProp = ['', null]
                        }
                    } else if (_t._meta.phase === 1) {
                        _t._meta.phase = 2 // begin building children
                        _t._flushCurrentElement()
                        _t._charEscaped = '['
                        _t._meta.phase = 0 // begin collecting element tag n.ame
                        _t._meta.tagName = ''
                        return // to circumvent the _charEscaped cancellation
                    }
                    break
                case '"':
                    if (_t._meta.phase === 0) {
                        if (_t._meta.isText) {
                            _t._meta.phase = 2 // begin collecting text
                        }
                    } else if (_t._meta.phase === 1) {
                        if (!_t._currentProp[1]) {
                            _t._currentProp[1] = ''
                        } else if (_t._isDomElement(_t._currentElement)) {
                            _t._setAttribute(_t._currentElement, ...(_t._currentProp as [string, string]))
                            _t._currentProp = ['', null]
                        }
                    } else if (_t._meta.phase === 2) {
                        if (_t._meta.isText) {
                            _t._currentElement = _t._createTextNode(_t._meta.text)
                            _t._meta.text = null
                            _t._meta.isText = false
                        }
                    }
                    break
                case ']':
                    if (_t._meta.phase === 1) {
                        if (_t._meta.isComponent) {
                            if (templates) {
                                const parser = new TemplateParser(templates[_t._meta.tagName])
                                parser.parseTemplate(templates)
                                parser.elements.forEach(element => {
                                    _t._currentElement = element
                                    _t._flushCurrentElement()
                                })
                            }
                            _t._meta.phase = null
                        } else {
                            _t._currentProp = null
                        }
                    } else if (_t._meta.phase === 2) {
                        _t._flushCurrentElement()
                        _t._meta.phase = null
                    } else if (_t._meta.phase == null) {
                        _t._meta.parent = null
                    }
                    break
                default:
                    if (_t._meta.phase === 0) { // collecting element tag name phase
                        if (char == '0') {
                            _t._meta.tagName = null
                            _t._meta.text = ''
                            _t._meta.isText = true
                        } else {
                            _t._meta.tagName += char
                        }
                    } else if (_t._meta.phase === 1) {
                        const index = Number(_t._currentProp[1] != null) // this.#currentProp[1] != null ? 1 : 0
                        _t._currentProp[index] += char
                    } else if (_t._meta.phase === 2) {
                        if (_t._meta.isText) {
                            _t._meta.text += char
                        }
                    }
            }
            _t._charEscaped = false
        })
    }

    private _flushCurrentElement() {
        if (this._meta.parent) {
            this._appendElement(this._meta.parent, this._currentElement)
        } else {
            this.elements.push(this._currentElement)
        }
        if (this._isDomElement(this._currentElement)) {
            this._meta.parent = this._currentElement
        }
        this._currentElement = null
    }
}
