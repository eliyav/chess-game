const path = require("path");
//const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development", // "production" | "development" | "none"
  entry: "./src/main.ts", // string | object | array
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    //publicPath: "/",
  },
  resolve: {
    extensions: [".ts", ".js", ".css", ".gltf", ".webp", ".png"],
  },
  devServer: {
    static: {
      publicPath: "/dist",
    },
  },
  // plugins: [
  //   new HtmlWebpackPlugin({
  //     title: "Development",
  //   }),
  // ],
  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif|gltf|webp)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
  devtool: "source-map",
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
