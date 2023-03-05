import {plugin} from 'bun'

plugin((await import('./bun-style-plugin')).default())
