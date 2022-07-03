/* eslint-disable @typescript-eslint/unbound-method, security/detect-unsafe-regex, @typescript-eslint/no-unsafe-call */
/* eslint-disable camelcase, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment */
const { resolve } = require('path');

const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  entry: resolve(__dirname, 'dist/index.js'),
  output: {
    path: resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    library: 'MarkdownExtractor',
    filename: 'bundle.min.js',
    globalObject: 'this',
  },
  mode: 'production',
  devtool: false,
  resolve: { extensions: ['.js', '.json'] },
  optimization: {
    usedExports: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.m?js(\?.*)?$/i,
        terserOptions: {
          ecma: 6,
          html5_comments: false,
          warnings: false,
          mangle: true,
          module: false,
          toplevel: false,
          nameCache: null,
          ie8: false,
          keep_classnames: undefined,
          keep_fnames: false,
          safari10: false,
          parse: {},
          compress: {},
          output: {
            comments: false,
            beautify: false,
          },
        },
      }),
    ],
  },
  performance: { hints: false },
  plugins: [new BundleAnalyzerPlugin({ openAnalyzer: false, analyzerMode: 'static' })],
  module: {
    rules: [
      { test: /\.json$/, loader: 'json-loader', exclude: [/node_modules/, /examples/, /docs/, /dist/, /coverage/] },
    ],
  },
};
