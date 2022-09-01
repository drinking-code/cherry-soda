import fs from 'fs'
import path from 'path'

import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'

import build from './build.js'
import start from './start.js'
import dev from './dev.js'

const packageJson = JSON.parse(
    fs.readFileSync(
        path.join(
            (new URL(import.meta.url)).pathname.replace(/\/[^/]+$/, ''),
            '..',
            'package.json'
        ), {encoding: 'utf8'})
)

const addNodeOption = (yargs, description) => {
    yargs.positional('node', {
        type: 'boolean',
        default: false,
        description
    })
}

const program = yargs(hideBin(process.argv))
    .scriptName(packageJson.name)
    .version('cherry-cola v' + packageJson.version)
    .usage('$0 <command> [options]')
    .command('build', 'Build assets for client (and node, if specified).',
        (yargs) => {
            addNodeOption(yargs, 'Also compile files for use with Node.js')
        }, build)
    .command('start', 'Start the built-in webserver.',
        (yargs) => {
            addNodeOption(yargs, 'Start Node.js server instead of Bun.js')
        }, start)
    .command('dev', 'Start the built-in webserver and build (and watches) assets for development.',
        (yargs) => {
            addNodeOption(yargs, 'Use Node.js server instead of Bun.js')
        }, dev)
    .help()
program.argv
