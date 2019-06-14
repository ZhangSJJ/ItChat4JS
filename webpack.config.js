/**
 * @time 2019/5/15
 */

const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin');

function getEntryFileList() {

    var fileList = [];

    function walk(path) {
        var dirList = fs.readdirSync(path);
        dirList.forEach(function (item) {
            if (fs.statSync(path + '/' + item).isDirectory()) {
                walk(path + '/' + item);
            } else {
                fileList.push(path + '/' + item);
            }
        });
    }

    walk(basePath);
    var ret = {}
    for (var jsfile of fileList) {
        var alias = jsfile.replace(`${basePath}/`, "").replace(".js", "")
        ret[alias] = jsfile
    }
    return ret;
}


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