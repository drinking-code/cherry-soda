import path from 'path'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

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
    mode: 'development',
    output: {
        filename: 'bundle.js',
        path: path.resolve('dist'),
        publicPath: '/'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
            '#cherry-soda': path.resolve('..', 'src', 'index.ts')
        }
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
                        localIdentName: "[name]_[local]__[hash:base64:5]",
                    }
                }
            }, ...postcssAndSass]
        }, {
            test: /\.svg$/i,
            type: 'asset/inline'
        }]
    },
    plugins: [new HtmlWebpackPlugin({
        templateContent: '<div id="app"></div>'
    }), new MiniCssExtractPlugin()]
})
const server = new WebpackDevServer({
    open: true,
    compress: true,
    port: 9000
}, compiler)

const runServer = async () => {
    console.log('Starting server...')
    await server.start()
}

runServer()
