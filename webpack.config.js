const path = require("path");

module.exports = {
  mode: "development", // "production" | "development" | "none"
  // Chosen mode tells webpack to use its built-in optimizations accordingly.
  entry: "./src/main.ts", // string | object | array
  // defaults to ./src
  // Here the application starts executing
  // and webpack starts bundling
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  resolve: {
    extensions: [".ts", ".js", ".css", ".gltf", ".webp", ".png"],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    historyApiFallback: true,
  },
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
