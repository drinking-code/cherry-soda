export default function (argv) {
    process.env.BUN_ENV = 'production'
    process.env.CHERRY_SODA_ENTRY = argv.entry
    process.env.CHERRY_SODA_OUTPUTPATH = argv.outdir
    import('../src/generator/index')
}
