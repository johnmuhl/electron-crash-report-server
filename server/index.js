import { unlink, writeFile } from "fs";
import Basic from "hapi-auth-basic";
import Boom from "boom";
import dotenv from "dotenv";
import Hapi from "hapi";
import Inert from "inert";
import massive from "massive";
import { promisify } from "util";
import { resolve } from "path";
import SQL from "./sql.js";
import { tmpdir } from "os";
import { walkStack } from "minidump";

const DUPLICATE_COLUMN = "42701";
const UNDEFINED_TABLE = "42P01";
const unlinkAsync = promisify(unlink);
const walkStackAsync = promisify(walkStack);
const writeFileAsync = promisify(writeFile);

dotenv.config();

const server = new Hapi.Server({
  port: process.env.PORT,
  router: { stripTrailingSlash: true },
});

function validate(request, user, pass) {
  if (!user || !pass) return Boom.unauthorized();
  if (user !== process.env.AUTH_USER) return Boom.unauthorized();
  if (pass !== process.env.AUTH_PASS) return Boom.unauthorized();

  return { credentials: { pass, user }, isValid: true };
}

async function main() {
  let db;
  let dumps;

  try {
    db = await massive(process.env.DATABASE_URL);
  } catch (error) {
    throw new Error(error);
  }

  try {
    dumps = await db.query("SELECT * FROM dumps");
  } catch (error) {
    if (error.code !== UNDEFINED_TABLE) throw new Error(error);
  }

  if (dumps) {
    // Add new columns to reports
    try {
      await db.query("ALTER TABLE reports ADD COLUMN dump bytea");
      await db.query(
        "ALTER TABLE reports ADD COLUMN open boolean DEFAULT TRUE"
      );
      await db.query("ALTER TABLE reports ADD COLUMN closed_at timestamptz");
      await db.query(
        "ALTER TABLE reports ADD COLUMN updated_at timestamptz DEFAULT now()"
      );
    } catch (error) {
      if (error.code !== DUPLICATE_COLUMN) throw new Error(error);
    }

    // Migrate dumps table to reports.dump
    try {
      await Promise.all(
        dumps.map(async dump => {
          await db.reports.update({
            dump: dump.file,
            id: dump.report_id,
          });
        })
      );
    } catch (error) {
      throw new Error(error);
    }

    // Add NOT NULL to dump column
    try {
      await db.query("ALTER TABLE reports ALTER COLUMN dump SET NOT NULL");
    } catch (error) {
      throw new Error(error);
    }

    // Drop old dumps table
    try {
      await db.query("DROP TABLE dumps");
    } catch (error) {
      throw new Error(error);
    }
  }

  try {
    await server.register([Basic, Inert]);
  } catch (error) {
    throw new Error(error);
  }

  try {
    // Prepare database
    await db.query(SQL);
  } catch (error) {
    throw new Error(error);
  }

  // Load, configure plugins
  server.auth.strategy("simple", "basic", { validate });

  // Application state
  server.app.db = db;
  server.app.env = process.env.NODE_ENV;
  server.app.user = process.env.AUTH_USER;
  server.app.pass = process.env.AUTH_PASS;
  server.app.auth = `${server.app.user}:${server.app.pass}`;

  // Application routes
  // route: GET /
  server.route({
    method: "GET",
    options: {
      auth: "simple",
      handler: (request, h) => {
        const auth = Buffer.from(server.app.auth).toString("base64");
        const index = resolve(__dirname, "public", "index.html");
        const isSecure = server.app.env === "production";
        const options = { isHttpOnly: false, isSecure };

        return h.file(index).state("authorization", auth, options);
      },
    },
    path: "/",
  });

  // route: POST /
  server.route({
    method: "POST",
    options: {
      handler: async request => {
        if (request.payload) {
          const body = Object.assign({}, request.payload);
          const dump = request.payload.upload_file_minidump;

          delete body.upload_file_minidump;

          try {
            const report = await server.app.db.reports.save({ body, dump });

            return report.id;
          } catch (error) {
            throw new Error(error);
          }
        } else {
          return Boom.badRequest();
        }
      },
    },
    path: "/",
  });

  // route: GET /reports
  server.route({
    method: "GET",
    options: {
      auth: "simple",
      handler: async request => {
        const select = "SELECT * FROM reports ORDER BY created_at DESC";
        let { limit, offset } = request.headers;

        limit = Number(limit) || 50;
        offset = Number(offset) || 0;

        const sql = `${select} LIMIT ${limit} OFFSET ${offset}`;

        try {
          const reports = await server.app.db.query(sql);

          return reports.map(r => {
            const report = Object.assign({}, r);

            delete report.dump;
            delete report.search;

            return report;
          });
        } catch (error) {
          throw new Error(error);
        }
      },
    },
    path: "/reports",
  });

  // route: GET /reports/:id
  server.route({
    method: "GET",
    options: {
      auth: "simple",
      handler: async request => {
        const id = Number(request.params.id);

        try {
          const report = await server.app.db.reports.find(id);

          delete report.dump;
          delete report.search;

          return report;
        } catch (error) {
          throw new Error(error);
        }
      },
    },
    path: "/reports/{id}",
  });

  // route: PATCH /reports/:id
  server.route({
    method: "PATCH",
    options: {
      auth: "simple",
      handler: async request => {
        const id = Number(request.params.id);

        try {
          const report = await server.app.db.reports.find(id);
          const closedAt = report.open ? new Date() : null;

          report.open = !report.open;
          report.closed_at = closedAt;

          const response = await server.app.db.reports.save(report);

          delete response.dump;
          delete response.search;

          return response;
        } catch (error) {
          throw new Error(error);
        }
      },
    },
    path: "/reports/{id}",
  });

  // route: DELETE /reports/:id
  server.route({
    method: "DELETE",
    options: {
      auth: "simple",
      handler: async request => {
        const id = Number(request.params.id);

        try {
          const response = await server.app.db.reports.destroy(id);

          delete response.dump;
          delete response.search;

          return response;
        } catch (error) {
          throw new Error(error);
        }
      },
    },
    path: "/reports/{id}",
  });

  // route: GET /reports/:id/dump
  server.route({
    method: "GET",
    options: {
      auth: "simple",
      handler: async (request, h) => {
        const id = Number(request.params.id);

        try {
          const report = await server.app.db.reports.find(id);
          // eslint-disable-next-line no-underscore-dangle
          const name = `${report.body._productName}-crash-${id}.dmp`;

          return h
            .response(report.dump)
            .header("content-disposition", `attachment; filename=${name}`)
            .type("application/x-dmp");
        } catch (error) {
          throw new Error(error);
        }
      },
    },
    path: "/reports/{id}/dump",
  });

  // route: GET /reports/:id/stack
  server.route({
    method: "GET",
    options: {
      auth: "simple",
      handler: async request => {
        const id = Number(request.params.id);

        try {
          const report = await server.app.db.reports.find(id);
          const path = resolve(tmpdir(), `${report.id}.dmp`);

          await writeFileAsync(path, report.dump, "binary");
          const stack = await walkStackAsync(path);
          await unlinkAsync(path);

          return { text: stack.toString() };
        } catch (error) {
          throw new Error(error);
        }
      },
    },
    path: "/reports/{id}/stack",
  });

  // Serve static assets
  server.route({
    method: "GET",
    options: {
      handler: (request, h) =>
        h.file(resolve(__dirname, "public", request.params.path)),
    },
    path: "/{path}",
  });

  // Start server
  try {
    await server.start();
  } catch (error) {
    throw new Error(error);
  }

  console.log(`Server running at: ${server.info.uri}`);

  return server;
}

main();
