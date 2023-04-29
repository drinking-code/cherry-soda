export default function (entry, options) {
    process.env.BUN_ENV = 'production'
    process.env.CHERRY_SODA_ENTRY = entry
    process.env.CHERRY_SODA_OUTPUTPATH = options.outdir
    import('../src/generator/index')
}
