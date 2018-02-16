**electron-crash-report-server** is a Node.js ([hapi], [svelte]) and PostgreSQL
([massive]) application for collecting crash reports from Electron applications.

## install

[![Deploy][deploy-img]][deploy-url]

During setup change the `AUTH_USER` and `AUTH_PASS` environment variables. Once
the app has deployed use those values to login.

_If crash reports do not appear after the first deploy restart the app._

Read the **development** section for information about running in other
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

**Requirements**: Node.js LTS 8.9+ and PostgreSQL 9.4+.

```sh
git clone https://github.com/johnmuhl/electron-crash-report-server
cd electron-crash-report-server
createdb electron-crash-report-server
cp .env-example .env
yarn && yarn dev
# make changes
yarn fmt
```

## bugs & features

Use the [issue tracker][issues] to report bugs or discuss changes and features.

## license

[MIT license][license]

[hapi]: https://hapijs.com/
[svelte]: https://svelte.technology/
[massive]: https://dmfay.github.io/massive-js/
[deploy-img]: https://www.herokucdn.com/deploy/button.svg
[deploy-url]: https://heroku.com/deploy
[docs]: http://electron.atom.io/docs/api/crash-reporter/
[example]: https://github.com/johnmuhl/electron-bomb
[demo]: https://pacific-falls-32011.herokuapp.com/
[issues]: https://github.com/johnmuhl/electron-crash-report-server/issues
[license]: https://github.com/johnmuhl/electron-crash-report-server/blob/master/LICENSE.md