'use strict'

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const Basic = require('hapi-auth-basic')
const Boom = require('boom')
const Handlebars = require('handlebars')
const Hapi = require('hapi')
const massive = require('massive')

const DELETE = 'DELETE'
const GET = 'GET'
const POST = 'POST'

const server = new Hapi.Server({
	port: process.env.PORT,
	router: {stripTrailingSlash: true},
})

async function main () {
	try {
		const db = await massive(process.env.DATABASE_URL)

		// Prepare and update database if necessary
		await db.run(require('./sql.js'))

		// Load and configure plugins
		await server.register({plugin: require('vision')})

		// server.app.db = db

		// server.views({
		//  engines: {html: Handlebars},
		//  relativeTo: __dirname,
		//  layout: true,
		//  path: 'views',
		// })

		await server.start()

		console.log(`Server running at: ${server.info.uri}`)

		return server
	} catch (error) {
		console.error(error)
		throw error
	}
}

// server.route({
//  method: GET,
//  path: '/',
//  config: {
//    handler: async (request, h) => {
//      const sql = 'SELECT * FROM reports ORDER BY created_at DESC'

//      try {
//        const reports = await server.app.db.run(sql)

//        return h.view('index', {reports, title: 'crash reports'})
//      } catch (error) {
//        throw error
//      }
//    },
//  },
// })

// server.route({
//  method: POST,
//  path: '/',
//  handler: async (request, h) => {
//    if (request.payload) {
//      const payload = Object.assign({}, request.payload)
//      const file = payload.upload_file_minidump

//      delete payload.upload_file_minidump

//      try {
//        const report = await server.app.db.reports.saveDoc(payload)

//        await server.app.db.dumps.insert({file, report_id: report.id})

//        return {}
//      } catch (error) {
//        throw error
//      }
//    } else {
//      return Boom.badRequest()
//    }
//  },
// })

// server.route({
//  method: GET,
//  path: '/reports/{id}',
//  config: {
//    handler: async (request, h) => {
//      const id = Number(request.params.id)

//      try {
//        const report = await server.app.db.reports.find(id)

//        report.body = JSON.stringify(report.body, null, 2)

//        return h.view('report', {report, title: 'crash report'})
//      } catch (error) {
//        throw error
//      }
//    },
//  },
// })

// server.route({
//  method: DELETE,
//  path: '/reports/{id}',
//  config: {
//    handler: async (request, h) => {
//      const id = Number(request.params.id)

//      try {
//        await server.app.db.dumps.destroy({report_id: id})
//        await server.app.db.reports.destroy({id})

//        return {}
//      } catch (error) {
//        throw error
//      }
//    },
//  },
// })

// server.route({
//  method: GET,
//  path: '/reports/{id}/dump',
//  config: {
//    handler: async (request, h) => {
//      const id = Number(request.params.id)

//      try {
//        const dump = await server.app.db.dumps.findOne({report_id: id})
//        const name = `crash-${id}.dmp`

//        return h
//          .response(dump.file)
//          .header('content-disposition', `attachment; filename=${name}`)
//          .type('application/x-dmp')
//      } catch (error) {
//        throw error
//      }
//    },
//  },
// })

main()
