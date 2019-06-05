/**
 * @time 2019/5/15
 */
'use strict';
const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin');


module.exports = {
    devtool: "source-map",
    target: "node",
    entry: {
        index: './src/index',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },

    module: {
        rules: [
            {
                test: /\.js|jsx/,
                use: [{
                    loader: 'babel-loader',
                }]
            },
        ]


    },
    plugins: [
        new CleanWebpackPlugin(),
    ],
    resolve: {}
};