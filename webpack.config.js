const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

/** @type {import("webpack").Configuration} */
module.exports = {
  mode: "development",
  entry: "./src/index.tsx",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Development",
      favicon: "./favicon.ico",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[name].css",
    }),
    new CompressionPlugin({
      algorithm: "gzip",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif|gltf|webp)$/i,
        type: "asset",
      },
    ],
  },
  devtool: "source-map",
  output: {
    clean: true,
  },
  //cache: { type: "filesystem" },
  //   devServer: {
  //     proxy: {
  //       // proxy URLs to backend development server
  //       "/api": "http://localhost:3000",
  //     },
  //     static: path.join(__dirname, "public"), // boolean | string | array | object, static file location
  //     compress: true, // enable gzip compression
  //     historyApiFallback: true, // true for index.html upon 404, object for multiple paths
  //     hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
  //     https: false, // true for self-signed, object for cert authority
  //     // ...
  //   },
};
