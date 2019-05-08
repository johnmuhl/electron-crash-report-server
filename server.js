import "dotenv/config";
import Boom from "@hapi/boom";
import Brok from "brok";
import Hapi from "@hapi/hapi";
import Inert from "@hapi/inert";
import Vision from "@hapi/vision";
import handlebars from "handlebars";
import massive from "massive";
import migrate from "./migrate.js";
import pretty_ms from "pretty-ms";
import pg_monitor from "pg-monitor";

import { promisify } from "util";
import { resolve } from "path";
import { tmpdir } from "os";
import { unlink, writeFile } from "fs";
import { walkStack } from "minidump";

const DELETE = "DELETE";
const GET = "GET";
const PATCH = "PATCH";
const POST = "POST";

const unlinkAsync = promisify(unlink);
const walkStackAsync = promisify(walkStack);
const writeFileAsync = promisify(writeFile);

const main = async () => {
	const database_url =
		process.env.DATABASE_URL ||
		"postgres://localhost/electron_crash_report_server_development";
	const server = Hapi.server({
		port: process.env.PORT || "3000",
		router: { stripTrailingSlash: true },
	});

	try {
		const db = await massive(database_url);

		await db.query(migrate);
		await server.register([Brok, Inert, Vision]);

		// pg_monitor.attach(db.driverConfig);

		server.app.db = db;

		server.views({
			engines: { handlebars },
			layout: true,
			path: "templates",
		});

		// route: GET /
		server.route({
			handler: async (request, h) => {
				const q = request.query;
				let columns = "id, body";
				let where = "closed_at is NULL";
				let select = `SELECT ${columns} FROM reports WHERE ${where} ORDER BY created_at DESC`;

				if (q.closed === "true" || q.closed === "" || q.open === "false") {
					columns = `${columns}, closed_at`;
					where = "closed_at is NOT NULL";
					select = `SELECT ${columns} FROM reports WHERE ${where} ORDER BY created_at DESC`;
				}

				try {
					const reports = await server.app.db.query(select);
					return h.view("index", { reports });
				} catch (error) {
					throw error;
				}
			},
			method: GET,
			path: "/",
		});

		// route: POST /
		server.route({
			handler: async (request, h) => {
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
						console.error(error);
						throw error;
					}

					try {
						const document = await server.app.db.reports.save(report);
						return document.id;
					} catch (error) {
						console.error(error);
						throw error;
					}
				} else {
					return Boom.badRequest();
				}
			},
			method: POST,
			path: "/",
		});

		// route: GET /r/{id}
		server.route({
			handler: async (request, h) => {
				const id = Number(request.params.id);
				const fields = ["id", "body", "closed_at", "created_at", "updated_at"];

				try {
					const compact = true;
					const report = await server.app.db.reports.findOne(
						{ id },
						{ fields }
					);
					const open = report.created_at;
					let close;

					report.body = JSON.stringify(report.body, null, "\t");

					if (report.closed_at) {
						close = report.closed_at;
						report.open_duration = pretty_ms(close - open, {
							compact,
						});
					} else {
						close = Date.now();
						report.open_duration = pretty_ms(close - open, {
							compact,
						});
					}

					return h.view("show", { report });
				} catch (error) {
					throw error;
				}
			},
			method: GET,
			path: "/r/{id}",
		});

		// route: PATCH /r/{id}
		server.route({
			handler: async (request, h) => {
				const id = Number(request.params.id);

				try {
					const compact = true;
					const report = await server.app.db.reports.find(id);
					const open = report.created_at;
					let close;

					report.closed_at = report.closed_at ? null : new Date();

					await server.app.db.reports.save(report);

					if (report.closed_at) {
						close = report.closed_at;
						report.open_duration = pretty_ms(close - open, {
							compact,
						});
					} else {
						close = Date.now();
						report.open_duration = pretty_ms(close - open, {
							compact,
						});
					}

					return {
						closed_at: report.closed_at,
						open_duration: report.open_duration,
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
			handler: async (request, h) => {
				const id = Number(request.params.id);

				try {
					const response = await server.app.db.reports.destroy(id);

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
				const id = Number(request.params.id);

				try {
					const report = await server.app.db.reports.find(id);
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
				const id = Number(request.params.id);

				try {
					const report = await server.app.db.reports.findOne(
						{
							id,
						},
						{
							fields: ["stack"],
						}
					);

					if (report.stack) {
						return h.response(report.stack).type("text/plain");
					}

					// Reports from pre-2.x do not have a stored stack trace.
					// Generate and store stack trace on first view.
					const document = await server.app.db.reports.find(id);
					const path = resolve(tmpdir(), `${document.id}.dmp`);

					await writeFileAsync(path, document.dump, "binary");

					const stack = await walkStackAsync(path);
					document.stack = report.stack = stack.toString();

					await unlinkAsync(path);
					await server.app.db.reports.save(document);

					return h.response(report.stack).type("text/plain");
				} catch (error) {
					throw error;
				}
			},
			method: GET,
			path: "/r/{id}/stack",
		});

		// Serve static assets
		server.route({
			handler: (request, h) => h.file(`assets/${request.params.filename}`),
			method: GET,
			path: "/assets/{filename}",
		});

		await server.start();
		console.log("Server running on %s", server.info.uri);

		return server;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

process.on("unhandledRejection", error => {
	console.error(error);
	process.exit(1);
});

main();
