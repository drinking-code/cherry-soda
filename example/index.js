import path from 'path'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserPlugin from 'terser-webpack-plugin'

const postcssAndSass = [{
    loader: 'resolve-url-loader',
    options: {
        sourceMap: true
    }
}, {
    loader: 'sass-loader',
    options: {
        sourceMap: true
    }
}]

const compiler = webpack({
    entry: path.resolve(process.cwd(), process.argv[2]),
    mode: process.env.NODE_ENV === 'build' ? 'production' : 'development',
    devtool: 'source-map',
    output: {
        filename: 'bundle.js',
        path: path.resolve('dist'),
        publicPath: '/'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
        rules: [{
            test: /\.[jt]sx?$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        '@babel/preset-typescript',
                        ['@babel/env', {
                            'targets': {
                                'browsers': [
                                    'last 2 versions'
                                ]
                            }
                        }]],
                    plugins: [['@babel/plugin-transform-react-jsx', {
                        runtime: 'automatic',
                        importSource: path.resolve('..', 'src')
                    }]]
                }
            }
        }, {
            test: /\.s?[ac]ss$/i,
            exclude: /\.module\.s?[ac]ss$/i,
            use: [MiniCssExtractPlugin.loader, {
                loader: 'css-loader',
                options: {
                    importLoaders: 2,
                    sourceMap: true
                }
            }, ...postcssAndSass]
        }, {
            test: /\.module\.s?[ac]ss$/i,
            use: [MiniCssExtractPlugin.loader, {
                loader: 'css-loader',
                options: {
                    importLoaders: 1,
                    sourceMap: true,
                    modules: {
                        mode: 'local',
                        localIdentName: '[name]_[local]__[hash:base64:5]'
                    }
                }
            }, ...postcssAndSass]
        }, {
            test: /\.svg$/i,
            type: 'asset/inline'
        }]
    },
    optimization: {
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
        minimize: process.env.NODE_ENV === 'build',
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    compress: {
                        arguments: true,
                        booleans_as_integers: true,
                        drop_console: true,
                        ecma: '2015',
                        passes: 2,
                        toplevel: true,
                    },
                    mangle: {
                        toplevel: true,
                    },
                    format: {
                        comments: false,
                        ecma: '2015',
                    },
                    toplevel: true,
                },
            }),
        ],
    },
    plugins: [new HtmlWebpackPlugin({
        templateContent: '<div id="app"></div>'
    }), new MiniCssExtractPlugin()]
})

if (process.env.NODE_ENV === 'build') {
    compiler.run()
} else {
    const server = new WebpackDevServer({
        open: true,
        compress: true,
        port: 9000
    }, compiler)

    console.log('Starting server...')
    await server.start()
}
