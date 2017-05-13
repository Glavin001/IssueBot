var webpack = require('webpack');

module.exports = {
  entry: {
    bundle: [
      './public/src/js/app.jsx',
      './public/src/index.html'
    ]
  },
  output: {
    path: __dirname + '/public/dist',
    filename: '[name].js'
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".js", ".jsx"]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.html$/,
        loader: "file-loader?name=[name].[ext]"
      }, {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['react-hot-loader', 'babel-loader?'+JSON.stringify({
          presets: [
            'react', 'es2015'
          ],
          plugins: [
            'syntax-class-properties',
            'transform-class-properties'
          ]
        })]
      }, {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }, {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader"]
      },
      // the url-loader uses DataUrls.
      // the file-loader emits files.
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff"
      }, {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader"
      }, {
        test: /\.(jpg|png)$/,
        loader: 'url?limit=25000',
        // include: PATHS.images
      }
    ]
  }
}