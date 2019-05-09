import "dotenv/config";
import { unlink, writeFile } from "fs";
import basic from "@hapi/basic";
import Boom from "@hapi/boom";
import brok from "brok";
import handlebars from "handlebars";
import hapi from "@hapi/hapi";
import inert from "@hapi/inert";
import massive from "massive";
import migrate from "./migrate.js";
import pgMonitor from "pg-monitor";
import pino from "hapi-pino";
import prettyMs from "pretty-ms";
import { promisify } from "util";
import { resolve } from "path";
import { tmpdir } from "os";
import vision from "@hapi/vision";
import { walkStack } from "minidump";

const DELETE = "DELETE";
const GET = "GET";
const PATCH = "PATCH";
const POST = "POST";
const production = process.env.NODE_ENV === "production";

const unlinkAsync = promisify(unlink);
const walkStackAsync = promisify(walkStack);
const writeFileAsync = promisify(writeFile);

const openedDuration = report => {
	const closed_at = report.closed_at || new Date();
	return prettyMs(closed_at - report.created_at, { compact: true });
};

const validate = async (request, username, password) => {
	if (!username || !password) return Boom.unauthorized();
	if (username !== process.env.AUTH_USER) return Boom.unauthorized();
	if (password !== process.env.AUTH_PASS) return Boom.unauthorized();

	return { credentials: { password, username }, isValid: true };
};

const main = async () => {
	const {
		env: { DATABASE_URL: database_url },
	} = process;
	const server = hapi.server({
		compression: { minBytes: 1 },
		port: process.env.PORT,
		router: { stripTrailingSlash: true },
	});

	try {
		const database = await massive(database_url);

		await database.query(migrate);
		await server.register([basic, brok, inert, vision]);

		if (!production) {
			await server.register(pino);
			pgMonitor.attach(database.driverConfig);
		}

		server.auth.strategy("simple", "basic", { validate });
		server.auth.default("simple");

		server.views({
			engines: { handlebars },
			layout: true,
			path: "templates",
		});

		// route: GET /
		server.route({
			handler: async (request, h) => {
				try {
					const { query } = request;

					let closed_active;
					let closed_count;
					let opened_active;
					let opened_count;
					let reports;

					if (
						query.closed === "true" ||
						query.closed === "" ||
						query.open === "false"
					) {
						reports = await database.query(
							/* eslint-disable-next-line max-len */
							`SELECT id, body, closed_at FROM reports WHERE closed_at is NOT NULL ORDER BY closed_at DESC`
						);

						[{ count: opened_count }] = await database.query(
							`select count(1) from reports where closed_at is null`
						);

						reports.forEach((x, i) => {
							let duration = prettyMs(Date.now() - x.closed_at, {
								compact: true,
							});
							duration = duration.replace(/~/, "");
							reports[i].closed_at = `closed ${duration} ago`;
						});

						closed_active = true;
						({ length: closed_count } = reports);
					} else {
						reports = await database.query(
							/* eslint-disable-next-line max-len */
							`SELECT id, body, created_at FROM reports WHERE closed_at is NULL ORDER BY created_at DESC`
						);

						[{ count: closed_count }] = await database.query(
							`select count(1) from reports where closed_at is not null`
						);

						reports.forEach((x, i) => {
							let duration = openedDuration(x);
							duration = duration.replace(/~/, "");
							reports[i].created_at = `opened ${duration} ago`;
						});

						opened_active = true;
						({ length: opened_count } = reports);
					}

					return h.view("index", {
						closed_active,
						closed_count,
						opened_active,
						opened_count,
						reports,
					});
				} catch (error) {
					throw error;
				}
			},
			method: GET,
			path: "/",
		});

		// route: POST /
		server.route({
			handler: async request => {
				if (request.payload) {
					const report = {
						body: Object.assign({}, request.payload),
						dump: request.payload.upload_file_minidump,
					};

					delete report.body.upload_file_minidump;

					// Generate and store stack trace from dump file.
					try {
						const path = resolve(tmpdir(), `${Date.now()}.dmp`);

						await writeFileAsync(path, report.dump, "binary");

						report.stack = await walkStackAsync(path);
						report.stack = report.stack.toString();

						await unlinkAsync(path);
					} catch (error) {
						console.error(error); /* eslint-disable-line no-console */
						throw error;
					}

					try {
						const document = await database.reports.save(report);
						return document.id;
					} catch (error) {
						console.error(error); /* eslint-disable-line no-console */
						throw error;
					}
				} else {
					return Boom.badRequest();
				}
			},
			method: POST,
			options: { auth: false },
			path: "/",
		});

		// route: GET /r/{id}
		server.route({
			handler: async (request, h) => {
				try {
					const id = Number(request.params.id);
					const fields = ["id", "body", "closed_at", "created_at"];
					const report = await database.reports.find(id, { fields });
					const [{ count: opened_count }] = await database.query(
						`select count(1) from reports where closed_at is null`
					);
					const [{ count: closed_count }] = await database.query(
						`select count(1) from reports where closed_at is not null`
					);

					let closed_active;
					let opened_active;

					report.opened_duration = openedDuration(report);
					report.body = JSON.stringify(report.body, null, "\t");
					report.created_at = report.created_at.toLocaleString();

					if (report.closed_at) {
						closed_active = true;
						report.closed_at = report.closed_at.toLocaleString();
					} else {
						opened_active = true;
					}

					return h.view("show", {
						closed_active,
						closed_count,
						opened_active,
						opened_count,
						report,
					});
				} catch (error) {
					throw error;
				}
			},
			method: GET,
			path: "/r/{id}",
		});

		// route: PATCH /r/{id}
		server.route({
			handler: async request => {
				try {
					const id = Number(request.params.id);
					const fields = ["id", "closed_at", "created_at"];
					const report = await database.reports.find(id, { fields });

					let closed_active;
					let opened_active;

					report.closed_at = report.closed_at ? null : new Date();

					await database.reports.save(report);

					const [{ count: opened_count }] = await database.query(
						`select count(1) from reports where closed_at is null`
					);
					const [{ count: closed_count }] = await database.query(
						`select count(1) from reports where closed_at is not null`
					);

					report.opened_duration = openedDuration(report);
					report.created_at = report.created_at.toLocaleString();

					if (report.closed_at) {
						closed_active = true;
						report.closed_at = report.closed_at.toLocaleString();
					} else {
						opened_active = true;
						report.closed_at = "—";
					}

					return {
						closed_active,
						closed_count,
						opened_active,
						opened_count,
						report,
					};
				} catch (error) {
					throw error;
				}
			},
			method: PATCH,
			path: "/r/{id}",
		});

		// route: DELETE /r/{id}
		server.route({
			handler: async request => {
				try {
					const id = Number(request.params.id);
					const response = await database.reports.destroy(id);

					return { id: response.id };
				} catch (error) {
					throw new Error(error);
				}
			},
			method: DELETE,
			path: "/r/{id}",
		});

		// route: GET /r/{id}/dump
		server.route({
			handler: async (request, h) => {
				try {
					const id = Number(request.params.id);
					const report = await database.reports.find(id);
					/* eslint-disable-next-line no-underscore-dangle */
					const name = `${report.body._productName}-crash-${id}.dmp`;

					return h
						.response(report.dump)
						.header("content-disposition", `attachment; filename=${name}`)
						.type("application/x-dmp");
				} catch (error) {
					throw error;
				}
			},
			method: GET,
			path: "/r/{id}/dump",
		});

		// route: GET /r/{id}/stack
		server.route({
			handler: async (request, h) => {
				try {
					const id = Number(request.params.id);
					const report = await database.reports.find(id, { fields: ["stack"] });

					// Reports from pre-2.x do not have a stored stack trace.
					// Generate and store stack trace on first view.
					if (!report.stack) {
						const document = await database.reports.find(id);
						const path = resolve(tmpdir(), `${document.id}.dmp`);

						await writeFileAsync(path, document.dump, "binary");

						const stack = await walkStackAsync(path);

						document.stack = stack.toString();
						report.stack = stack.toString();

						await unlinkAsync(path);
						await database.reports.save(document);
					}

					return h.response(report.stack).type("text/plain");
				} catch (error) {
					throw error;
				}
			},
			method: GET,
			path: "/r/{id}/stack",
		});

		// route: GET /search
		server.route({
			handler: async (request, h) => {
				const {
					query: { app, version, process_type, platform },
				} = request;
				const [{ count: opened_count }] = await database.query(
					`select count(1) from reports where closed_at is null`
				);
				const [{ count: closed_count }] = await database.query(
					`select count(1) from reports where closed_at is not null`
				);

				let reports = [];
				let select = `select id, body, created_at, closed_at from reports where`;
				let where = ``;

				if (app) {
					if (where) where = `${where} and`;
					where = `${where} body @> '{"_productName": "${app}"}'`;
				}

				if (version) {
					if (where) where = `${where} and`;
					where = `${where} body @> '{"_version": "${version}"}'`;
				}

				if (process_type) {
					if (where) where = `${where} and`;
					where = `${where} body @> '{"process_type": "${process_type}"}'`;
				}

				if (platform) {
					if (where) where = `${where} and`;
					where = `${where} body @> '{"platform": "${platform}"}'`;
				}

				select = `${select} ${where} order by created_at desc`;
				reports = await database.query(select);

				reports.forEach((x, i) => {
					let duration = openedDuration(x);
					duration = duration.replace(/~/, "");
					reports[i].created_at = `opened ${duration} ago`;
				});

				reports.forEach((x, i) => {
					if (x.closed_at) {
						let duration = prettyMs(Date.now() - x.closed_at, {
							compact: true,
						});
						duration = duration.replace(/~/, "");
						reports[i].closed_at = `closed ${duration} ago`;
					}
				});

				return h.view("search", { closed_count, opened_count, reports });
			},
			method: GET,
			path: "/search",
		});

		// Serve static assets
		server.route({
			handler: (request, h) => h.file(`assets/${request.params.filename}`),
			method: GET,
			path: "/assets/{filename}",
		});

		await server.start();

		return server;
	} catch (error) {
		console.error(error); /* eslint-disable-line no-console */
		throw error;
	}
};

process.on("unhandledRejection", error => {
	console.error(error); /* eslint-disable-line no-console */
	process.exit(1);
});

main();
