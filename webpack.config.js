const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // Change to your "entry-point".
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    modules: [path.resolve(__dirname, 'node_modules')]
  },
  module: {
    rules: [{
      // Include ts, tsx, and js files.
      test: /\.(tsx?)|(js)$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        presets: [
          '@babel/preset-env',
          '@babel/preset-typescript'
        ],
      },
    }],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};