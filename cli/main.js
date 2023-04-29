import fs from 'fs'
import path from 'path'

import {Command} from 'commander'

import build from './build.js'
import render from './render.js'
import start from './start.js'
import dev from './dev.js'

import projectRoot from '../src/utils/project-root.js'
import moduleRoot from '../src/utils/module-root.js'

const packageJson = JSON.parse(
    fs.readFileSync(
        path.join(
            path.dirname((new URL(import.meta.url)).pathname),
            '..',
            'package.json'
        ), 'utf8')
)

if (process.argv.includes('start') || process.argv.includes('dev'))
    process.env.INTERNAL_DEV = projectRoot === moduleRoot ? 'true' : 'false'

if (!process.env.PORT)
    process.env.PORT = '3000'

const program = new Command()

program
    .name(packageJson.name)
    .version(packageJson.version)

program.command('build')
    .description('Build assets for client')
    .argument('<entry>', 'Entry file for cherry-soda')
    .action(build)

program.command('render')
    .description('Generate static pages and assets')
    .argument('<entry>', 'Entry file for cherry-soda')
    .option('-o, --outdir <path>', 'Output directory to save the files to')
    .action(render)

program.command('start')
    .description('Start the built-in webserver')
    .argument('<entry>', 'Entry file for cherry-soda')
    .action(start)

program.command('dev')
    .description('Start the built-in webserver and build (and watch) assets for development')
    .argument('<entry>', 'Entry file for cherry-soda')
    .action(dev)

program.parse()
