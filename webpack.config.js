'use strict'

const {resolve} = require('path')

module.exports = {
	entry: resolve(__dirname, 'client.js'),

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
}
