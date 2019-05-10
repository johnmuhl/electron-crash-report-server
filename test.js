process.env.DATABASE_URL = `postgres://localhost/electron_crash_report_server_test`;
process.env.PORT = `0`;

const fixtures = require(`./fixtures/index.js`);
const lab = require(`@hapi/lab`);
const { expect } = require(`@hapi/code`);
const { start } = require(`./server.js`);
const {
	after,
	afterEach,
	before,
	beforeEach,
	describe,
	it,
} = (exports.lab = lab.script()); /* eslint-disable-line no-multi-assign */

const OK = 200;
const auth = {
	credentials: {
		password: `electron`,
		username: `crash`,
	},
	strategy: `simple`,
};

describe(`electron crash report server`, () => {
	let server;
	let report;

	before(async () => {
		server = await start();
	});

	beforeEach(async () => {
		report = await server.app.database.reports.save(fixtures[0]);
	});

	after(async () => {
		await server.stop();
	});

	afterEach(async () => {
		await server.app.database.query(`delete from reports *`);
	});

	it(`GET / must respond successfully`, async () => {
		const response = await server.inject({
			auth,
			method: `get`,
			url: `/`,
		});
		expect(response.statusCode).to.equal(OK);
	});

	it(`GET /?closed must respond successfully`, async () => {
		const response = await server.inject({
			auth,
			method: `get`,
			url: `/?closed=true`,
		});
		expect(response.statusCode).to.equal(OK);
	});

	it(`GET /r/{id} must respond successfully`, async () => {
		const response = await server.inject({
			auth,
			method: `get`,
			url: `/r/${report.id}`,
		});
		expect(response.statusCode).to.equal(OK);
	});

	it(`GET /r/{id}/dump must respond successfully`, async () => {
		const response = await server.inject({
			auth,
			method: `get`,
			url: `/r/${report.id}/dump`,
		});
		expect(response.statusCode).to.equal(OK);
		expect(response.headers[`content-type`]).to.equal(`application/x-dmp`);
	});

	it(`GET /r/{id}/stack must respond successfully`, async () => {
		const response = await server.inject({
			auth,
			method: `get`,
			url: `/r/${report.id}/stack`,
		});
		expect(response.statusCode).to.equal(OK);
		expect(response.headers[`content-type`]).to.equal(
			`text/plain; charset=utf-8`
		);
	});

	it(`GET /search must respond successfully`, async () => {
		const response = await server.inject({
			auth,
			method: `get`,
			url: `/search`,
		});
		expect(response.statusCode).to.equal(OK);
	});

	it(`GET /search?app must respond successfully`, async () => {
		const response = await server.inject({
			auth,
			method: `get`,
			url: `/search?app=test`,
		});
		expect(response.statusCode).to.equal(OK);
	});

	it(`GET /search?version must respond successfully`, async () => {
		const response = await server.inject({
			auth,
			method: `get`,
			url: `/search?version=test`,
		});
		expect(response.statusCode).to.equal(OK);
	});

	it(`GET /search?process_type must respond successfully`, async () => {
		const response = await server.inject({
			auth,
			method: `get`,
			url: `/search?process_type=test`,
		});
		expect(response.statusCode).to.equal(OK);
	});

	it(`GET /search?platform must respond successfully`, async () => {
		const response = await server.inject({
			auth,
			method: `get`,
			url: `/search?platform=test`,
		});
		expect(response.statusCode).to.equal(OK);
	});

	it(`GET /assets must respond successfully`, async () => {
		const response = await server.inject({
			auth,
			method: `get`,
			url: `/assets/favicon.png`,
		});
		expect(response.statusCode).to.equal(OK);
		expect(response.headers[`content-type`]).to.equal(`image/png`);
	});
});
