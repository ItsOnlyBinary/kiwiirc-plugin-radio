const fs = require('fs');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const devConfig = require('./build/configs/dev');
const prodConfig = require('./build/configs/prod');

module.exports = (env, argv) => {
    const isDev = env.WEBPACK_SERVE;
    let config = {
        mode: isDev ? 'development' : 'production',
    };

    if (argv.mode) {
        config.mode = argv.mode;
    }

    if (argv.stats) {
        config.plugins = [
            new BundleAnalyzerPlugin(),
        ];
    }

    if (isDev) {
        config = devConfig(env, argv, config);
    } else {
        config = prodConfig(env, argv, config);
    }

    if (argv['write-config']) {
        fs.writeFileSync('webpack.effective.json', JSON.stringify(config, null, 4));
    }

    return config;
};
