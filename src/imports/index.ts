import {plugin} from 'bun'

plugin((await import('./bun-style-plugin')).default())
plugin((await import('./jsx-patch-plugin')).default())
