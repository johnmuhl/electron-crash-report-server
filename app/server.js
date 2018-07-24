import "dotenv/config";
import basicAuth from "express-basic-auth";
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import { manifest } from "./manifest/server.js";
import massive from "massive";
import sapper from "sapper";
import sirv from "sirv";
import { Store } from "svelte/store.js";

const user = process.env.AUTH_USER;
const pass = process.env.AUTH_PASS;
const auth = `${user}:${pass}`;
const cookie = Buffer.from(auth).toString("base64");

const basicAuthMiddleware = basicAuth({
  challenge: true,
  realm: "electron crash report server",
  users: { [user]: pass },
});

const server = express();
const store = () =>
  new Store({
    application: "",
    applications: [],
    closed: false,
    devicePixelRatio: 1,
    report: {},
    reports: [],
  });

function authRequired(req) {
  return !(req.method === "POST" && req.path === "/");
}

massive(process.env.DATABASE_URL)
  .then(db => {
    server.set("db", db);
    server.use(cookieParser());
    server.use(
      (req, res, next) =>
        authRequired(req) ? basicAuthMiddleware(req, res, next) : next()
    );
    server.use((req, res, next) => {
      if (authRequired(req)) {
        res.cookie("authorization", cookie, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
        });
      }

      next();
    });
    server.use(express.json());
    server.use(compression({ threshold: 0 }));
    server.use(sirv("assets"));
    server.use(sapper({ manifest, store }));
    server.listen(process.env.PORT);
  })
  .catch(error => {
    console.error(error);
    throw error;
  });
