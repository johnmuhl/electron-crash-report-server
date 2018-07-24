// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require("webpack");
const config = require("sapper/webpack/config.js");

const mode = process.env.NODE_ENV;
const isDev = mode === "development";

module.exports = {
  devtool: isDev && "inline-source-map",
  entry: config.client.entry(),
  mode,
  module: {
    rules: [
      {
        test: /\.html$/,
        use: {
          loader: "svelte-loader",
          options: {
            dev: isDev,
            hotReload: true,
            hydratable: true,
          },
        },
      },
    ],
  },
  output: config.client.output(),
  plugins: [
    isDev && new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      "process.browser": true,
      "process.env.NODE_ENV": JSON.stringify(mode),
    }),
  ].filter(Boolean),
  resolve: {
    extensions: [".js", ".json", ".html"],
    mainFields: ["svelte", "module", "browser", "main"],
  },
};
