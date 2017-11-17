'use strict'

const MinifyPlugin = require('babel-minify-webpack-plugin')
const webpack = require('webpack')
const {resolve} = require('path')

module.exports = {
	entry: resolve(__dirname, 'client', 'index.js'),

	output: {
		path: resolve(__dirname, 'public'),
		filename: 'index.js',
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},
		],
	},

	plugins: [
		new MinifyPlugin(),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
	],
}
