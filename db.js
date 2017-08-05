'use strict'

const massive = require('massive')

const connectionString = process.env.DATABASE_URL
const createDumps = require('./sql/create-dumps.js')
const createReports = require('./sql/create-reports.js')
const db = massive.connectSync({connectionString})

db.run(createReports, (err, _) => {
	if (err) throw err
	db.run(createDumps, (err, _) => {
		if (err) throw err
	})
})

module.exports = db
