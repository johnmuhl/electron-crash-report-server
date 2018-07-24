/* global document */
let auth;

if (process.browser) {
  // eslint-disable-next-line prefer-destructuring
  auth = document.cookie.split("=")[1];
} else {
  const user = process.env.AUTH_USER;
  const pass = process.env.AUTH_PASS;
  auth = Buffer.from(`${user}:${pass}`).toString("base64");
}

const authorization = `Basic ${auth.replace("%3D", "=")}`;

export default {
  authorization,
};
