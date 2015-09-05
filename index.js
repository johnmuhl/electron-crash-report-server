'use strict'

const authorize = require('./authorize')
const bodyParser = require('body-parser')
const config = require('./config')
const deleteCrashReport = require('./delete-crash-report')
const downloadDumpFile = require('./download-dump-file')
const editConfig = require('./edit-config')
const express = require('express')
const fs = require('fs')
const listCrashReports = require('./list-crash-reports')
const methodOverride = require('method-override')
const saveConfig = require('./save-config')
const saveCrashReport = require('./save-crash-report')
const viewCrashReport = require('./view-crash-report')

fs.accessSync('.', fs.W_OK)

const app = express()
const server = app.listen(config.port, function () {
  const addr = server.address().address
  const port = server.address().port
  console.log(`crash report server running at http://${addr}:${port}`)
})

app.set('trust proxy', true)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))
app.use(methodOverride('_method'))

app.post('/', saveCrashReport)

if (config.web.enabled) {
  app.get('/', authorize, listCrashReports)
  app.get('/config', authorize, editConfig)
  app.get('/:id', authorize, viewCrashReport)
  app.get('/:id/:attachment', authorize, downloadDumpFile)
  app.post('/config', authorize, saveConfig)
  app.delete('/:id', authorize, deleteCrashReport)
}
