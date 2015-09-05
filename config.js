'use strict'

const fs = require('fs')
const ini = require('ini')
let config = {}

fs.access('config.inix', fs.R_OK | fs.W_OK, function (err) {
  if (err && err.code === 'ENOENT') {
    config.port = process.env.PORT
    config.web = {
      enabled: process.env.WEB_ENABLED,
      user: process.env.WEB_USER,
      pass: process.env.WEB_PASS
    }
    config.email = {
      enabled: process.env.EMAIL_ENABLED,
      subject: process.env.EMAIL_SUBJECT,
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      provider: process.env.EMAIL_PROVIDER,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
    if (!config.port ||
        !config.web.enabled ||
        !config.email.subject ||
        !config.email.from ||
        !config.email.to ||
        !config.email.provider ||
        !config.email.user ||
        !config.email.pass) throw new Error('invalid configuration')
  } else if (err) {
    throw err
  } else {
    config = ini.parse(fs.readFileSync('config.ini', 'utf-8'))
  }
})

module.exports = config
