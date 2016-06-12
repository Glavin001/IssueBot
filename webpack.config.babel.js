var webpack = require('webpack');

module.exports = {
  entry: {
    // 'webpack-dev-server/client?http://localhost:3000',
    // 'webpack/hot/only-dev-server',
    // './public/src/js/app.jsx',
    javascript: './public/src/js/app.jsx',
    html: './public/src/index.html'
  },
  output: {
    path: './public/dist',
    filename: 'app.bundle.js'
  },
  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.html$/,
        loader: "file?name=[name].[ext]"
      }, {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['react-hot', 'babel?'+JSON.stringify({
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
        loader: 'style!css'
      }, {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"]
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