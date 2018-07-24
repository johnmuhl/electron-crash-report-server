const config = require("sapper/webpack/config.js");
const pkg = require("../package.json");

module.exports = {
  entry: config.server.entry(),
  externals: Object.keys(pkg.dependencies),
  mode: process.env.NODE_ENV,
  module: {
    rules: [
      {
        test: /\.html$/,
        use: {
          loader: "svelte-loader",
          options: {
            css: false,
            generate: "ssr",
          },
        },
      },
    ],
  },
  output: config.server.output(),
  performance: {
    hints: false, // it doesn't matter if server.js is large
  },
  resolve: {
    extensions: [".js", ".json", ".html"],
    mainFields: ["svelte", "module", "browser", "main"],
  },
  target: "node",
};
