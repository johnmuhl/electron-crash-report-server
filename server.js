import "dotenv/config";
import Boom from "@hapi/boom";
import Brok from "brok";
import Hapi from "@hapi/hapi";
import Inert from "@hapi/inert";
import Pino from "hapi-pino";
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
const production = process.env.NODE_ENV === "production";

const unlinkAsync = promisify(unlink);
const walkStackAsync = promisify(walkStack);
const writeFileAsync = promisify(writeFile);

function opened_duration(report) {
	const closed_at = report.closed_at || new Date();
	return pretty_ms(closed_at - report.created_at, { compact: true });
}

const main = async () => {
	const database_url = process.env.DATABASE_URL;
	const server = Hapi.server({
		compression: { minBytes: 1 },
		port: process.env.PORT,
		router: { stripTrailingSlash: true },
	});

	try {
		const db = await massive(database_url);

		await db.query(migrate);
		await server.register([
			Brok,
			Inert,
			Vision,
			{
				plugin: Pino,
				options: {
					prettyPrint: !production,
				},
			},
		]);

		pg_monitor.attach(db.driverConfig);

		server.views({
			engines: { handlebars },
			layout: true,
			path: "templates",
		});

		// route: GET /
		server.route({
			handler: async (request, h) => {
				try {
					const q = request.query;

					let closed_active, closed_count, opened_active, opened_count, reports;

					if (q.closed === "true" || q.closed === "" || q.open === "false") {
						reports = await db.query(
							`SELECT id, body, closed_at FROM reports WHERE closed_at is NOT NULL ORDER BY closed_at DESC`
						);

						[{ count: opened_count }] = await db.query(
							`select count(1) from reports where closed_at is null`
						);

						reports.forEach(r => {
							let duration = pretty_ms(Date.now() - r.closed_at, {
								compact: true,
							});
							duration = duration.replace(/~/, "");
							r.closed_at = `closed ${duration} ago`;
						});

						closed_active = true;
						closed_count = reports.length;
					} else {
						reports = await db.query(
							`SELECT id, body, created_at FROM reports WHERE closed_at is NULL ORDER BY created_at DESC`
						);

						[{ count: closed_count }] = await db.query(
							`select count(1) from reports where closed_at is not null`
						);

						reports.forEach(r => {
							let duration = opened_duration(r);
							duration = duration.replace(/~/, "");
							r.created_at = `opened ${duration} ago`;
						});

						opened_active = true;
						opened_count = reports.length;
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
						const document = await db.reports.save(report);
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
				try {
					const id = Number(request.params.id);
					const fields = ["id", "body", "closed_at", "created_at"];
					const report = await db.reports.find(id, { fields });
					const [{ count: opened_count }] = await db.query(
						`select count(1) from reports where closed_at is null`
					);
					const [{ count: closed_count }] = await db.query(
						`select count(1) from reports where closed_at is not null`
					);

					let closed_active, opened_active;

					report.opened_duration = opened_duration(report);
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
			handler: async (request, h) => {
				try {
					const id = Number(request.params.id);
					const fields = ["id", "closed_at", "created_at"];
					const report = await db.reports.find(id, { fields });

					let closed_active, opened_active;

					report.closed_at = report.closed_at ? null : new Date();

					await db.reports.save(report);

					const [{ count: opened_count }] = await db.query(
						`select count(1) from reports where closed_at is null`
					);
					const [{ count: closed_count }] = await db.query(
						`select count(1) from reports where closed_at is not null`
					);

					report.opened_duration = opened_duration(report);
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
			handler: async (request, h) => {
				try {
					const id = Number(request.params.id);
					const response = await db.reports.destroy(id);

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
					const report = await db.reports.find(id);
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
					const report = await db.reports.find(id, { fields: ["stack"] });

					// Reports from pre-2.x do not have a stored stack trace.
					// Generate and store stack trace on first view.
					if (!report.stack) {
						const document = await db.reports.find(id);
						const path = resolve(tmpdir(), `${document.id}.dmp`);

						await writeFileAsync(path, document.dump, "binary");

						const stack = await walkStackAsync(path);

						document.stack = report.stack = stack.toString();

						await unlinkAsync(path);
						await db.reports.save(document);
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
				const { app, version, process_type, platform } = request.query;
				const [{ count: opened_count }] = await db.query(
					`select count(1) from reports where closed_at is null`
				);
				const [{ count: closed_count }] = await db.query(
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
				reports = await db.query(select);

				reports.forEach(r => {
					let duration = opened_duration(r);
					duration = duration.replace(/~/, "");
					r.created_at = `opened ${duration} ago`;
				});

				reports.forEach(r => {
					if (r.closed_at) {
						let duration = pretty_ms(Date.now() - r.closed_at, {
							compact: true,
						});
						duration = duration.replace(/~/, "");
						r.closed_at = `closed ${duration} ago`;
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
