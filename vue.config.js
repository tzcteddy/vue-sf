const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const nodeExternals = require('webpack-node-externals');
const merge = require('lodash.merge');
const TARGET_NODE = process.env.WEBPACK_TARGET === 'node';
const target = TARGET_NODE ? 'server' : 'client';

module.exports = {
    css: {
        extract: process.env.NODE_ENV === 'production'
    },
    configureWebpack: (config) => {
        // 将 entry 指向应用程序的 server / client 文件
        config.entry = `./src/entry-${target}.js`;
        config.output.libraryTarget = TARGET_NODE ? 'commonjs2' : undefined;
        // 对 bundle renderer 提供 source map 支持
        config.devtool = 'source-map'
        config.target = TARGET_NODE ? 'node' : 'web';
        config.node = TARGET_NODE ? undefined : false;
        
        // https://webpack.js.org/configuration/externals/#function
        // https://github.com/liady/webpack-node-externals
        // 外置化应用程序依赖模块。可以使服务器构建速度更快，
        // 并生成较小的 bundle 文件。
        config.externals = TARGET_NODE ? nodeExternals({
            // 不要外置化 webpack 需要处理的依赖模块。
            // 你可以在这里添加更多的文件类型。例如，未处理 *.vue 原始文件，
            // 你还应该将修改 `global`（例如 polyfill）的依赖模块列入白名单
            allowlist: [/\.[^css]$/]
        }) : undefined;
            Object.assign(config, {
                optimization: {
                    splitChunks: TARGET_NODE ? { name: 'commonjs2' } : false
                },
                plugins: [...config.plugins,TARGET_NODE ? new VueSSRServerPlugin() : new VueSSRClientPlugin()]
            })
            console.log(config)
    },
    chainWebpack: config => {
        config.module
            .rule('vue')
            .use('vue-loader')
            .tap(options => {
                merge(options, {
                    optimizeSSR: false
                })
            })
        if (TARGET_NODE) {
            config.plugins.delete('hmr');
        }
    }
}