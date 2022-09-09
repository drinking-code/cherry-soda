import {imageLoader} from './images.js'

if (typeof Bun !== 'undefined')
    import('bun').then(({plugin}) => {
        plugin(imageLoader)
    })
