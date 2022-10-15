import path from 'path'

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

const fileName = '../README.md'
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
                ''
            ].join("\n")
        })
    )
    .use(retextStringify)
    .process(await read(fileName, 'utf8'))

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
const fullFileName = path.resolve(fileName)
for (const source in groupedMessage) {
    /** @type VFileMessage[] */
    const messages = groupedMessage[source]
    if (messages.length > 0)
        console.log(chalk.bold(fillWithSeparator(source)))
    for (const message of messages) {
        console.log(`file://${fullFileName}:${message.position.start.line}:${message.position.start.column}`)
        console.log(message.message)
    }
    console.log(' ')
}

console.log("\n")

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
