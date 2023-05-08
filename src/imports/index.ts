import {plugin, type BunPlugin} from 'bun'

plugin((await import('./bun-style-plugin')).default())
plugin((await import('./jsx-patch-plugin')).default())
plugin((await import('./images')).default() as Parameters<BunPlugin>[0])
