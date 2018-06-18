const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');

let config = require('./webpack.config.js');
const options = {
  contentBase: './dist',
  hot: true,
  host: 'localhost',
  inline: true
};

config.plugins.push(new webpack.HotModuleReplacementPlugin());

webpackDevServer.addDevServerEntrypoints(config, options);
const compiler = webpack(config);
const server = new webpackDevServer(compiler, options);

server.listen(5000, 'localhost', () => {
  console.log('dev server listening on port 5000');
});
