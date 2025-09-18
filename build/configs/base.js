const { merge } = require('webpack-merge');

const ESLintPlugin = require('eslint-webpack-plugin');
const ESLintFormatter = require('eslint-formatter-friendly');
const { VueLoaderPlugin } = require('vue-loader');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');

const utils = require('../utils');
const pkg = require('../../package.json');

const cssConfig = require('./css');

module.exports = (env, argv, config) => {
    let sourceMap;
    if (config.mode === 'development') {
        sourceMap = env.WEBPACK_SERVE ? 'eval-source-map' : 'source-map';
    } else if (argv.srcmap) {
        sourceMap = 'source-map';
    }

    const baseConfig = merge(config, {
        context: process.cwd(),

        entry: {
            [pkg.name.replace(/^kiwiirc-/, '')]: './src/plugin.js',
            [pkg.name.replace(/^kiwiirc-/, '') + '-hls']: './src/hls.js',
        },

        devtool: sourceMap,

        output: {
            path: utils.pathResolve('dist'),
            publicPath: 'auto',
        },

        resolve: {
            alias: {
                '@': utils.pathResolve('src'),
            },
            extensions: ['.js', '.jsx', '.vue', '.json'],
        },

        resolveLoader: {
            modules: [
                utils.pathResolve('node_modules'),
                utils.pathResolve('build/plugins/webpack'),
            ],
        },

        externals: {
            vue: 'kiwi.Vue',
            lodash: '_',
        },

        performance: {
            maxEntrypointSize: 512 * utils.KiB, // 0.5MiB
            maxAssetSize: 512 * utils.KiB, // 0.5MiB
        },

        plugins: [
            new ESLintPlugin({
                emitError: true,
                emitWarning: true,
                failOnError: false,
                extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue'],
                formatter: ESLintFormatter,
            }),
            new VueLoaderPlugin(),
            new CaseSensitivePathsPlugin(),
            new CopyPlugin({
                patterns: [
                    {
                        from: utils.pathResolve('static'),
                        to: utils.pathResolve('dist/plugin-radio/'),
                        toType: 'dir',
                        globOptions: {
                            ignore: ['.*', '**/stations.json', '**/stations.local.json'],
                        },
                    },
                    {
                        from: utils.pathResolve('node_modules/hls.js/dist/hls.worker.js'),
                        to: utils.pathResolve('dist/plugin-radio/hls.worker.js'),
                    },
                ],
            }),
            new FriendlyErrorsWebpackPlugin(),
        ],

        module: {
            rules: [
                {
                    test: /\.vue$/,
                    use: [
                        {
                            loader: 'vue-loader',
                            options: {
                                transformAssetUrls: {
                                    // Defaults
                                    video: ['src', 'poster'],
                                    source: 'src',
                                    img: 'src',
                                    image: ['xlink:href', 'href'],
                                    use: ['xlink:href', 'href'],

                                    // Object can be used for svg files
                                    object: 'data',
                                },
                                compilerOptions: {
                                    comments: false,
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.m?jsx?$/,
                    exclude: (file) => {
                        // always transpile js in vue files
                        if (/\.vue\.jsx?$/.test(file)) {
                            return false;
                        }
                        // Don't transpile node_modules
                        return /node_modules/.test(file);
                    },
                    use: ['thread-loader', 'babel-loader'],
                },

                // images
                {
                    test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
                    type: 'asset',
                    generator: { filename: 'static/img/[name].[contenthash:8][ext][query]' },
                },

                // svg
                {
                    test: /\.(svg)(\?.*)?$/,
                    use: ['vue-loader', 'svg-loader'],
                },

                // media
                {
                    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                    type: 'asset',
                    generator: { filename: 'static/media/[name].[contenthash:8][ext][query]' },
                },

                // fonts
                {
                    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
                    type: 'asset',
                    generator: { filename: 'static/fonts/[name].[contenthash:8][ext][query]' },
                },
            ],
        },
    });

    return cssConfig(env, argv, baseConfig);
};
