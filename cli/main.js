import fs from 'fs'
import path from 'path'

import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'

import build from './build.js'
import start from './start.js'
import dev from './dev.js'

import {resolve as resolveProjectRoot} from '../src/utils/project-root.js'

process.env.NODE_NO_WARNINGS = '1'

const packageJson = JSON.parse(
    fs.readFileSync(
        path.join(
            path.dirname((new URL(import.meta.url)).pathname),
            '..',
            'package.json'
        ), {encoding: 'utf8'})
)

const addNodeOption = (yargs, description) =>
    yargs.option('node', {
        type: 'boolean',
        default: false,
        description
    })

const pureArgs = hideBin(
    Array.from(process.argv).filter(v => v !== '--')
)

if (JSON.parse(
    fs.readFileSync(
        resolveProjectRoot('package.json'),
        {encoding: 'utf8'})
).name === packageJson.name)
    process.env.CHERRY_COLA_ENV = 'development'

if (!process.env.PORT)
    process.env.PORT = '3000'

const program = yargs(pureArgs)
    .scriptName(packageJson.name)
    .version('cherry-soda v' + packageJson.version)
    .usage('$0 <command> [options] <entry>')
    .command('build [options] <entry>', 'Build assets for client (and node, if specified).',
        (yargs) => {
            addNodeOption(yargs, 'Also compile files for use with Node.js')
                .version(false)
        }, build)
    .command('start [options] <entry>', 'Start the built-in webserver.',
        (yargs) => {
            addNodeOption(yargs, 'Start Node.js server instead of Bun.js')
                .version(false)
        }, start)
    .command('dev [options] <entry>', 'Start the built-in webserver and build (and watches) assets for development.',
        (yargs) => {
            addNodeOption(yargs, 'Use Node.js server instead of Bun.js')
                .version(false)
                .positional('entry', {
                    describe: 'Entry file for cherry-soda'
                })
        },
        dev
    )
    .coerce('entry', (arg) => {
        return path.join(process.cwd(), arg)
    })
    .help()
program.argv
