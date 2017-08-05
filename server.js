'use strict'

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const Basic = require('hapi-auth-basic')
const Boom = require('boom')
const Handlebars = require('handlebars')
const Hapi = require('hapi')
const Vision = require('vision')
const db = require('./db.js')

const port = process.env.PORT
const server = new Hapi.Server()

server.connection({port})

server.register([Basic, Vision], err => {
	if (err) throw err

	server.auth.strategy('simple', 'basic', {
		validateFunc: (request, user, pass, cb) => {
			if (!user || !pass) return cb(null, false)
			if (user !== process.env.AUTH_USER) return cb(null, false)
			if (pass === process.env.AUTH_PASS) {
				return cb(null, true, {})
			} else {
				return cb(null, false)
			}
		},
	})

	server.views({
		engines: {html: Handlebars},
		relativeTo: __dirname,
		layout: true,
		path: 'views',
	})

	server.route({
		method: 'GET',
		path: '/',
		config: {
			auth: 'simple',
			handler: (request, reply) => {
				const sql = 'SELECT * FROM reports ORDER BY created_at DESC'
				db.run(sql, (err, reports) => {
					if (err) throw err
					const auth = Buffer.from(
						`${process.env.AUTH_USER}:${process.env.AUTH_PASS}`
					).toString('base64')
					const opts = {
						isHttpOnly: false,
						isSecure: process.env.NODE_ENV === 'production',
					}
					reply
						.view('index', {reports, title: 'crash reports'})
						.state('authorization', auth, opts)
				})
			},
		},
	})

	server.route({
		method: 'GET',
		path: '/reports/{id}',
		config: {
			auth: 'simple',
			handler: (request, reply) => {
				const id = Number(request.params.id)
				db.reports.find(id, (err, report) => {
					if (err) throw err
					report.body = JSON.stringify(report.body, null, 2)
					reply.view('report', {report, title: 'crash report'})
				})
			},
		},
	})

	server.route({
		method: 'DELETE',
		path: '/reports/{id}',
		config: {
			auth: 'simple',
			handler: (request, reply) => {
				const id = Number(request.params.id)
				db.dumps.destroy({report_id: id}, (err, res) => {
					if (err) throw err
					db.reports.destroy({id}, (err, res) => {
						if (err) throw err
						reply().location('/')
					})
				})
			},
		},
	})

	server.route({
		method: 'GET',
		path: '/reports/{id}/dump',
		config: {
			auth: 'simple',
			handler: (request, reply) => {
				const id = Number(request.params.id)
				db.dumps.findOne({report_id: id}, (err, dump) => {
					if (err) throw err
					const filename = `crash-${id}.dmp`
					reply(dump.file)
						.header('content-disposition', `attachment; filename=${filename}`)
						.type('application/x-dmp')
				})
			},
		},
	})

	server.route({
		method: 'POST',
		path: '/',
		handler: (request, reply) => {
			if (request.payload) {
				const payload = Object.assign({}, request.payload)
				const file = payload.upload_file_minidump

				delete payload.upload_file_minidump

				db.reports.saveDoc(payload, (err, report) => {
					if (err) throw err

					db.dumps.insert({file, report_id: report.id}, (err, dump) => {
						if (err) throw err

						reply()
					})
				})
			} else {
				const error = Boom.badRequest()

				reply(error)
			}
		},
	})

	server.start(err => {
		if (err) throw err

		console.log(`Server running at: ${server.info.uri}`)
	})
})
