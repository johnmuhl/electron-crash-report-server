'use strict'

const MinifyPlugin = require('babel-minify-webpack-plugin')
const webpack = require('webpack')
const {resolve} = require('path')

const env = process.env.NODE_ENV || 'development'
const config = {
	entry: resolve(__dirname, 'client', 'index.js'),

	output: {
		path: resolve(__dirname, 'server', 'public'),
		filename: 'index.js',
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					{loader: 'css-loader', options: {importLoaders: 1}},
					'postcss-loader',
				],
			},
		],
	},

	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(env),
		}),
	],
}

if (env === 'production') {
	config.devtool = false
	config.plugins.push(new MinifyPlugin())
} else {
	config.devtool = 'eval-cheap-module-source-map'
}

module.exports = config
