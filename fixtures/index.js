const { readFileSync } = require("fs");
const { resolve } = require("path");

const dump = readFileSync(resolve(__dirname, "./mini.dmp"));
const stack = readFileSync(resolve(__dirname, "./stack.txt"), "utf-8");

const fixtures = [
	{
		body: {
			_companyName: "inwhile",
			_productName: "Electron",
			_version: "3.1.8",
			extra: "info from the main process",
			platform: "win32",
			process_type: "browser",
			prod: "Electron" /* eslint-disable-line unicorn/prevent-abbreviations */,
			ptime: "13035812",
			rept: "electron-crash-service",
			ver: "3.1.8",
		},
		dump,
		stack,
	},
];

module.exports = fixtures;
