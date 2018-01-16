import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import minify from "rollup-plugin-babel-minify";
import resolve from "rollup-plugin-node-resolve";

export default {
  input: "client/index.js",
  output: {
    file: "server/public/bundle.js",
    format: "iife",
    name: "ECRS",
  },
  plugins: [commonjs(), json(), minify(), resolve()],
};
