const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const { DefinePlugin } = require("webpack");
const path = require("path");

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
    new DefinePlugin({
      AUTH0_DOMAIN: JSON.stringify(process.env.AUTH0_DOMAIN),
      AUTH0_CLIENT_ID: JSON.stringify(process.env.AUTH0_CLIENT_ID),
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
    path: path.resolve(__dirname, "dist"),
  },
  // devServer: {
  //   port: 3000,
  //   proxy: {
  //     "/login": {
  //       target: "http://localhost:8080",
  //     },
  //     "/socket.io": {
  //       target: "http://localhost:8080",
  //       ws: true,
  //     },
  //   },
  //   compress: true, // enable gzip compression
  //   hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
  // },
};
