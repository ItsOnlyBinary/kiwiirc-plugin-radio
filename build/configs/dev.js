const fs = require('fs');
const chokidar = require('chokidar');
const { merge } = require('webpack-merge');
const murmurhash3 = require('murmurhash3js');
const utils = require('../utils');
const pkg = require('../../package.json');

const baseConfig = require('./base');

const stationsPattern = /\/plugin-radio\/stations\.json$/;
let configWatcher = null;

module.exports = (env, argv, config) => {
    const pluginNumber = Math.abs(murmurhash3.x86.hash32(pkg.name)) % 1000;
    const portNumber = utils.mapRange(pluginNumber, 0, 999, 9000, 9999);

    const devConfig = {
        plugins: [],

        devServer: {
            devMiddleware: {
                publicPath: 'auto',
            },
            open: false,
            host: '127.0.0.1',
            port: portNumber,
            allowedHosts: ['localhost', '127.0.0.1'],
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            static: [
                {
                    directory: utils.pathResolve('static'),
                    publicPath: 'static',
                },
            ],
            client: {
                logging: 'info',
                overlay: {
                    runtimeErrors: true,
                    errors: true,
                    warnings: false,
                },
            },

            setupMiddlewares: (middlewares, devServer) => {
                devServer.app.get(stationsPattern, async (req, res) => {
                    if (configWatcher) {
                        await configWatcher.close();
                        configWatcher = null;
                    }

                    const configFiles = ['stations.local.json', 'stations.json'];

                    let configPath = null;
                    for (const filePath of configFiles) {
                        const resolvedPath = utils.pathResolve('static/', filePath);
                        if (fs.existsSync(resolvedPath)) {
                            configPath = resolvedPath;
                            break;
                        }
                    }

                    if (!configPath) {
                        res.statusCode = 404;
                        res.end('Not Found');
                        return;
                    }

                    try {
                        const config = fs.readFileSync(configPath);
                        configWatcher = chokidar.watch(configPath);
                        configWatcher.on(
                            'change',
                            (path) => devServer.sendMessage(
                                devServer.webSocketServer.clients,
                                'content-changed'
                            ),
                        );
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Content-Type', 'application/json');
                        res.setHeader('Cache-Control', 'no-store');
                        res.setHeader('Pragma', 'no-cache');
                        res.setHeader('Expires', '0');
                        res.end(config);
                    } catch (err) {
                        res.statusCode = 500;
                        res.end('Internal Server Error');
                    }
                });

                return middlewares;
            },
        },

        infrastructureLogging: {
            level: 'warn',
        },

        stats: {
            all: false,
            loggingDebug: ['sass-loader'],
        },
    };

    if (argv.host) {
        devConfig.devServer.host = argv.host === true ? '0.0.0.0' : argv.host;
    }

    if (argv.port) {
        devConfig.devServer.port = argv.port;
    }

    return merge(baseConfig(env, argv, config), devConfig);
};
