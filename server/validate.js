const Boom = require('boom')

module.exports = function validate (request, user, pass) {
	if (!user || !pass) return Boom.unauthorized()
	if (user !== process.env.AUTH_USER) return Boom.unauthorized()
	if (pass === process.env.AUTH_PASS) {
		return {isValid: true, credentials: {user, pass}}
	} else {
		return Boom.unauthorized()
	}
}
