import cjs from "rollup-plugin-commonjs";
import css from "rollup-plugin-css-only";
import img from "rollup-plugin-img";
import json from "rollup-plugin-json";
import minify from "rollup-plugin-babel-minify";
import resolve from "rollup-plugin-node-resolve";

const production = process.env.NODE_ENV === "production";

export default {
  input: "client/index.js",
  output: {
    file: "server/public/bundle.js",
    format: "iife",
    name: "ECRS",
  },
  plugins: [
    cjs(),
    json(),
    resolve(),
    css({ output: "server/public/bundle.css" }),
    img(),
    production ? minify() : {},
  ],
};
