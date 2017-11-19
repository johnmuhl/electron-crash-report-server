'use strict'

const Basic = require('hapi-auth-basic')
const Boom = require('boom')
const dotenv = require('dotenv')
const Handlebars = require('handlebars')
const Hapi = require('hapi')
const Inert = require('inert')
const massive = require('massive')
const {resolve} = require('path')
const SQL = require('./sql.js')
const Vision = require('vision')

dotenv.config()

const server = new Hapi.Server({
	port: process.env.PORT,
	router: {stripTrailingSlash: true},
})

async function main () {
	try {
		const db = await massive(process.env.DATABASE_URL)

		// Prepare, upgrade database
		await db.run(SQL)

		// Load, configure plugins
		await server.register([Basic, Inert, Vision])
		server.auth.strategy('simple', 'basic', {validate})
		server.views({
			engines: {html: Handlebars},
			relativeTo: __dirname,
			layout: true,
			path: 'views',
		})

		// Application state
		server.app.db = db
		server.app.env = process.env.NODE_ENV
		server.app.user = process.env.AUTH_USER
		server.app.pass = process.env.AUTH_PASS
		server.app.auth = `${server.app.user}:${server.app.pass}`

		// Application routes
		// route: GET /
		server.route({
			method: 'GET',
			path: '/',
			options: {
				auth: 'simple',
				handler: async (request, h) => {
					const auth = Buffer.from(server.app.auth).toString('base64')
					const isSecure = server.app.env === 'production'
					const options = {isHttpOnly: false, isSecure}

					return h.view('index').state('authorization', auth, options)
				},
			},
		})

		// route: POST /
		server.route({
			method: 'POST',
			path: '/',
			options: {
				handler: async (request, h) => {
					if (request.payload) {
						const body = Object.assign({}, request.payload)
						const dump = request.payload.upload_file_minidump

						delete body.upload_file_minidump

						try {
							await server.app.db.reports.save({body, dump})

							return {}
						} catch (error) {
							console.log(error)
							throw new Error(error)
						}
					} else {
						return Boom.badRequest()
					}
				},
			},
		})

		// route: GET /reports
		server.route({
			method: 'GET',
			path: '/reports',
			options: {
				auth: 'simple',
				handler: async (request, h) => {
					const sql = 'SELECT * FROM reports ORDER BY created_at DESC'

					try {
						const reports = await server.app.db.run(sql)

						return reports.map(r => {
							const report = Object.assign({}, r)

							delete report.dump
							delete report.search

							return report
						})
					} catch (error) {
						throw new Error(error)
					}
				},
			},
		})

		// route: GET /reports/:id
		server.route({
			method: 'GET',
			path: '/reports/{id}',
			options: {
				auth: 'simple',
				handler: async (request, h) => {
					const id = Number(request.params.id)

					try {
						const report = await server.app.db.reports.find(id)

						delete report.dump
						delete report.search

						return report
					} catch (error) {
						throw new Error(error)
					}
				},
			},
		})

		// route: PATCH /reports/:id
		server.route({
			method: 'PATCH',
			path: '/reports/{id}',
			options: {
				auth: 'simple',
				handler: async (request, h) => {
					const id = Number(request.params.id)

					try {
						const report = await server.app.db.reports.find(id)
						const closedAt = report.open ? new Date() : null

						report.open = !report.open
						report.closed_at = closedAt

						return await server.app.db.reports.save(report)
					} catch (error) {
						console.error(error)
						throw new Error(error)
					}
				},
			},
		})

		// route: DELETE /reports/:id
		server.route({
			method: 'DELETE',
			path: '/reports/{id}',
			options: {
				auth: 'simple',
				handler: async (request, h) => {
					const id = Number(request.params.id)

					try {
						return await server.app.db.reports.destroy(id)
					} catch (error) {
						throw new Error(error)
					}
				},
			},
		})

		// route: GET /reports/:id/dump
		server.route({
			method: 'GET',
			path: '/reports/{id}/dump',
			options: {
				auth: 'simple',
				handler: async (request, h) => {
					const id = Number(request.params.id)
					const name = `crash-${id}.dmp`

					try {
						const report = await server.app.db.reports.find(id)

						return h
							.response(report.dump)
							.header('content-disposition', `attachment; filename=${name}`)
							.type('application/x-dmp')
					} catch (error) {
						throw new Error(error)
					}
				},
			},
		})

		// Serve static assets
		server.route({
			method: 'GET',
			path: '/{path}',
			options: {
				handler: (request, h) =>
					h.file(resolve(__dirname, 'public', request.params.path)),
			},
		})

		// Start server
		await server.start()
		console.log(`Server running at: ${server.info.uri}`)

		return server
	} catch (error) {
		console.error(error)
		throw error
	}
}

function validate (request, user, pass) {
	if (!user || !pass) return Boom.unauthorized()
	if (user !== process.env.AUTH_USER) return Boom.unauthorized()
	if (pass === process.env.AUTH_PASS) {
		return {isValid: true, credentials: {user, pass}}
	} else {
		return Boom.unauthorized()
	}
}

main()
