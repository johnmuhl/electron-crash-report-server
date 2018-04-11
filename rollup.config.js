import cjs from "rollup-plugin-commonjs";
import cssnext from "postcss-cssnext";
import minify from "rollup-plugin-babel-minify";
import postcss from "postcss";
import resolve from "rollup-plugin-node-resolve";
import svelte from "rollup-plugin-svelte";

const production = process.env.NODE_ENV === "production";

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
    resolve(),
    svelte({
      cascade: false,
      css: css => css.write("server/public/bundle.css"),
      dev: !production,
      preprocess: {
        style: async ({ content }) => {
          const { css } = await postcss([cssnext]).process(content, {
            from: undefined,
          });

          return { code: css };
        },
      },
      store: true,
    }),
    production && minify(),
  ],
};
