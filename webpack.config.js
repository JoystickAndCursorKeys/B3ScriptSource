const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
     loader: './src/sys/bootloader_static.js',
     worker: './tmp/basicworker.js'
   },
  devtool: 'source-map',
  output: {
    filename: 'basic[name].js',
    path: path.resolve(__dirname, 'dist/static'),
  },
  plugins: [
  ]
};
