**electron-crash-report-server** is a Node.js ([hapi]) and PostgreSQL
([massive]) application for collecting crash reports from Electron applications.

## install

[![Deploy][deploy-img]][deploy-url]

During setup change the `AUTH_USER` and `AUTH_PASS` environment variables. Once
the app has deployed use those values to login.

_If crash reports do not appear after the first deploy restart the app._

Read the [**development**](#development) section for information about running in other
environments.

## usage

```javascript
const { crashReporter } = require("electron");
crashReporter.start({
	// ...other options
	submitURL: "https://app-name-12345.herokuapp.com/",
});
```

Refer to the [`crashReporter` documentation][docs] for the full details.

**Important**: Don't forget to start the `crashReporter` in the main process
_and each renderer that will create crash reports_.

Check out the [example electron app][example] and [demo server][demo] for a
working example. The login and password for the demo are **`crash`** and
**`electron`**.

If there are no sample reports use the [example] (or any other) app to add some
reports to the demo server.

## development

[![CircleCI][circle-img]][circle-url]

**Requirements**: Node.js LTS 10.x and PostgreSQL 11.x.

```sh
git clone https://github.com/johnmuhl/electron-crash-report-server
cd electron-crash-report-server
createdb electron_crash_report_server_development
cp .env.example .env
yarn install
yarn start:dev
# make changes
yarn fmt
yarn test
```

## bugs & features

Use the [issue tracker][issues] to report bugs or discuss changes and features.

## license

[The Unlicense][license]

[hapi]: https://hapijs.com/
[massive]: https://massivejs.org/
[circle-img]: https://img.shields.io/circleci/project/github/johnmuhl/electron-crash-report-server.svg?style=for-the-badge
[circle-url]: https://circleci.com/gh/johnmuhl/electron-crash-report-server
[deploy-img]: https://img.shields.io/badge/deploy-heroku-%237056BF.svg?style=for-the-badge
[deploy-url]: https://heroku.com/deploy
[docs]: https://electronjs.org/docs/api/crash-reporter
[example]: https://github.com/johnmuhl/electron-bomb
[demo]: https://pacific-falls-32011.herokuapp.com/
[issues]: https://github.com/johnmuhl/electron-crash-report-server/issues
[license]:
	https://github.com/johnmuhl/electron-crash-report-server/blob/master/license.markdown
