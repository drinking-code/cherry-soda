import path from 'path'
import fs from 'fs'

import chalk from 'chalk'

import {VFileMessage} from 'vfile-message'
import {read} from 'to-vfile'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRetext from 'remark-retext'
import retextEnglish from 'retext-english'
import retextCasePolice from '@julian_cataldo/retext-case-police'
import retextIndefiniteArticle from 'retext-indefinite-article'
import retextReadability from 'retext-readability'
import retextRepeatedWords from 'retext-repeated-words'
import retextSpell from 'retext-spell'
import dictionary from 'dictionary-en-gb'
import retextStringify from 'retext-stringify'

import {daleChall} from 'dale-chall'
import {spache} from 'spache'
import {syllable} from 'syllable'

const filename = '../README.md'
const fileContents = fs.readFileSync(filename, {encoding: 'utf8'})
const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRetext, unified()
        .use(retextEnglish)
        .use(retextCasePolice)
        .use(retextIndefiniteArticle)
        .use(retextReadability)
        .use(retextRepeatedWords)
        .use(retextSpell, {
            dictionary,
            personal: [
                'CLI',
                'dev/development',
                'DOM',
                'HMR',
                'JSX',
                'math',
                'natively/native',
                'preliminarily/preliminary',
                'webpack',
            ].join("\n"),
            ignore: ['DIwhy']
        })
    )
    .use(retextStringify)
    .process(await read(filename, 'utf8'))

const plugins = ['retext-case-police', 'retext-indefinite-article', 'retext-readability', 'retext-repeated-words', 'retext-spell']
const groupedMessage = Object.fromEntries(plugins.map(id => [id, []]))
file.messages.forEach(message => {
    groupedMessage[message.source].push(message)
})

const separatorTotalLength = 32 + 16
const fillWithSeparator = text => {
    const length = (separatorTotalLength - 2 - text.length) / 2
    return Array(Math.floor(length)).fill('=').join('') +
        ' ' +
        text +
        ' ' +
        Array(Math.ceil(length)).fill('=').join('')
}
const fullFilename = path.resolve(filename)
const fileContentsLines = fileContents.split("\n")
for (const source in groupedMessage) {
    /** @type VFileMessage[] */
    const messages = groupedMessage[source]
    if (messages.length === 0) continue
    console.log(chalk.bold(fillWithSeparator(source)))
    const isReadability = source === 'retext-readability'/*fileContents*/
    for (const message of messages) {
        console.log(message.message)
        if (isReadability) {
            const sentence = getSentence(message.position)
            printUnfamiliarWords(sentence, daleChall, 'Dale-Chall')
            printUnfamiliarWords(sentence, spache, 'Spache')
            printHighSyllableCount(sentence)
        }
        console.log(`${fullFilename}:${message.position.start.line}:${message.position.start.column}`)
    }
    console.log('')
}

function printUnfamiliarWords(sentence, familiarWords, type) {
    const words = sentence
        .replace(/\s+/g, ' ')
        .replace(/[^\w ]/g, '')
        .split(' ')
    const unfamiliarWords = words.filter(word => {
        return !familiarWords.includes(word.toLowerCase()) &&
            !familiarWords.includes(word.toLowerCase().replace(/ed|s|ly$/g, '')) &&
            !familiarWords.includes(word.toLowerCase().replace(/d$/g, '')) &&
            !familiarWords.includes(word.toLowerCase().replace(/ily$/g, 'y'))
    })
    console.log(`[${type}] Unfamiliar words: ${unfamiliarWords.map(word => chalk.yellow(word)).join(', ')}`)
}

function printHighSyllableCount(sentence) {
    const words = sentence
        .replace(/\s+/g, ' ')
        .replace(/[^\w ]/g, '')
        .split(' ')
    const wordSyllables = words.map(word => {
        const syllables = syllable(word)
        if (syllables === 1) return null
        return word +
            chalk.gray(` [${
                chalk[syllables <= 3 ? 'yellow' : 'red'](syllables)
            }]`)
    }).filter(v => v)
    console.log(`[Flesch, Gunning fog, SMOG] Words with many syllables: ${wordSyllables.join(' ')}`)
}

function getSentence(position) {
    const extract = fileContentsLines.slice(position.start.line - 1, position.end.line)
    extract[0] = extract[0].substring(position.start.column - 1, extract[0].length)
    const lastI = extract.length - 1
    extract[lastI] = extract[lastI].substring(0, position.end.column - 1)
    return extract.join(' ').trim()
}

console.log('')

const okChar = chalk.green('✓')
const notOkChar = chalk.yellow('!')
for (const source in groupedMessage) {
    const messagesAmount = groupedMessage[source].length
    console.log([
        messagesAmount === 0 ? okChar : notOkChar,
        source,
        chalk.gray(`[${messagesAmount}]`)
    ].join(' '))
}
