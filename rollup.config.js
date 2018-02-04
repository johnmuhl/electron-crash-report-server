import cjs from "rollup-plugin-commonjs";
// import cssnext from "postcss-cssnext";
import img from "rollup-plugin-img";
import json from "rollup-plugin-json";
import minify from "rollup-plugin-babel-minify";
// import postcss from "rollup-plugin-postcss";
import resolve from "rollup-plugin-node-resolve";
import svelte from "rollup-plugin-svelte";

export default {
  input: "client/index.js",
  output: {
    file: "server/public/bundle.js",
    format: "iife",
    name: "ECRS",
    sourcemap: true,
  },
  plugins: [
    cjs(),
    json(),
    resolve(),
    // postcss({
    //   extract: "server/public/bundle.css",
    //   minimize: { autoprefixer: false },
    //   plugins: [cssnext],
    //   sourceMap: true,
    // }),
    svelte({
      css: css => css.write("server/public/bundle.css"),
      store: true,
    }),
    img(),
    minify(),
  ],
};
