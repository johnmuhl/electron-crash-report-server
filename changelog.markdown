# Changelog

## [unreleased]

### Added

- Create GitHub issues from crash reports
- Create Gitlab issues from crash reports

## [2.0.1] - 2019-06-20

### Fixed

- Don't fail validation when "extra" information is posted

## [2.0.0] - 2019-05-10

### Added

- Search by application, version, process type and platform
- Use Joi to validate POST payload.
- Log PostgreSQL and HTTP requests in development
- Use brotli compression

### Changed

- Upgrade to Node.js 10
- Upgrade to PostgreSQL 11
- New database schema; existing databases will be upgraded automatically

## [1.2.0] - 2018-06-04

### Fixed

- Update application selector on scroll
- Maintain sort order in application selector

## [1.1.0] - 2018-03-01

### Changed

- Include application in minidump filename

### Fixed

- Correct `alt` attributes for timestamp images

## [1.1.0-rc.1] - 2018-02-16

### Added

- View stack traces in web client
- Compile web client assets
- Dependency on eslint-plugin-html
- Dependency on minidump
- Dependency on npm-run-all
- Dependency on parse-ms
- Dependency on postcss
- Dependency on postcss-cssnext
- Dependency on rollup
- Dependency on rollup-plugin-babel-minify
- Dependency on rollup-plugin-commonjs
- Dependency on rollup-plugin-node-resolve
- Dependency on rollup-plugin-svelte
- Dependency on sb-debounce
- Dependency on svelte
- CHANGELOG.md

### Changed

- Increase browser support
- Improve mobile browsing experience
- Return crash report ID after creation
- Upgrade Heroku deployments to PostgreSQL 10.1
- Update Node.js to 8.9.4
- Update @std/esm to 0.21.4
- Update inert to 5.1.0
- Update massive to 4.6.4
- Update eslint to 4.17.0
- Update eslint-config-oz to 2.2.1
- Update nodemon to 1.14.12
- Update prettier to 1.10.2
- Pin versions

### Fixed

- Use `Object.assign` instead of the spread operator
- Database upgrades no longer output errors

## [1.0.0] - 2018-01-01

### Changed

- Update Node.js to 8.9.3
- Update hapi to 17.2.0
- Update nodemon to 1.14.7

## [1.0.0-rc.8] - 2017-12-27

### Changed

- Pin yarn version to 1.3.2
- Update eslint to 4.14.0
- Update eslint-config-oz to 2.2.0
- Update nodemon to 1.14.3
- Update prettier to 1.9.2

### Fixed

- Ensure `sans-serif` fonts

## [1.0.0-rc.7] - 2017-12-05

### Changed

- Use `Map` and `Set` in state
- Use object spread in props

### Fixed

- Responses no longer contain the minidump blob
- Crash report pagination

## [1.0.0-rc.6] - 2017-12-03

### Removed

- Server-side views
- Dependency on handlebars
- Dependency on vision

## [1.0.0-rc.5] - 2017-12-03

### Added

- Paginate crash reports

## [1.0.0-rc.4] - 2017-12-03

### Added

- Use javascript modules on the server
- Dependency on @std/esm

### Changed

- Update eslint-config-oz to 1.3.0

### Fixed

- Correct link to license

## [1.0.0-rc.3] - 2017-12-02

### Changed

- Update eslint-config-oz to 1.2.0

### Fixed

- Style issues

## [1.0.0-rc.2] - 2017-12-01

### Fixed

- Heroku deployments

## [1.0.0-rc.1] - 2017-12-01

### Added

- Open, closed status to crash reports
- Dependency on nodemon
- favicon

### Changed

- Database schema; move dumps into `reports` table and drop `dumps` table
- Improved web client
- Include dotenv in production
- Update Node.js to 8.9.1
- Update boom to 7.1.1
- Update hapi to 17.0.2
- Update hapi-auth-basic to 5.0.0
- Update inert to 5.0.1
- Update massive to 4.5.0
- Update vision to 5.2.0
- Update eslint to 4.11.0
- Update prettier to 1.8.2

### Removed

- Move `electron-bomb` to its own repository
- Dependency on node-dev

## [0.5.6] - 2017-10-28

### Added

- Dependency on eslint-config-oz

### Changed

- Update boom to 6.0.0
- Update handlebars to 4.0.11
- Update hapi to 16.6.2
- Update eslint to 4.10.0
- Update prettier to 1.7.4

### Removed

- Dependency on eslint-config-standard
- Dependency on eslint-config-standard-jsx
- Dependency on eslint-plugin-import
- Dependency on eslint-plugin-node
- Dependency on eslint-plugin-promise
- Dependency on eslint-plugin-react
- Dependency on eslint-plugin-standard

## [0.5.5] - 2017-10-28

### Changed

- Update Node.js to 6.11.5

## [0.5.4] - 2017-10-28

### Changed

- Update Node.js to 6.11.1

## [0.5.3] - 2017-05-23

### Added

- Dependency on eslint
- Dependency on eslint-config-standard
- Dependency on eslint-config-standard-jsx
- Dependency on eslint-plugin-import
- Dependency on eslint-plugin-node
- Dependency on eslint-plugin-promise
- Dependency on eslint-plugin-react
- Dependency on eslint-plugin-standard
- Dependency on prettier

### Changed

- Format code with Prettier

### Removed

- Dependency on snazzy
- Dependency on standard

## [0.5.2] - 2017-05-23

### Added

- Example `dotenv` file

### Changed

- Upgrade Heroku deployments to PostgreSQL 9.6
- Update electron to 1.6.8

## [0.5.1] - 2017-05-03

### Changed

- Remove overly restrictive check on `POST` params

## [0.5.0] - 2017-05-03

### Fixed

- Replace use of unsafe `new Buffer` with `Buffer.from`

## [0.4.1] - 2016-12-21

### Fixed

- Update version number

## [0.4.0] - 2016-12-21

### Added

- Deploy to Heroku button
- Sample Electron app to generate crashes
- Dependency on boom
- Dependency on handlebars
- Dependency on hapi
- Dependency on hapi-auth-basic
- Dependency on massive
- Dependency on vision
- Dependency on dotenv
- Dependency on node-dev
- Dependency on snazzy
- Dependency on standard

### Changed

- Update Node.js to 6.9.2

### Removed

- Server config file; use `env` variables
- Dependency on basic-auth
- Dependency on body-parser
- Dependency on express
- Dependency on ini
- Dependency on lodash
- Dependency on method-override
- Dependency on multiparty
- Dependency on node-uuid
- Dependency on nodemailer
- Dependency on pouchdb
- Dependency on virtual-dom

## [0.3.0] - 2015-09-14

### Added

- Warn when using default config on the web

### Changed

- Remove 100 doc limit from crash report list
- Switch from io.js to Node.js

## [0.2.0] - 2015-09-04

### Added

- Delete reports from the web
- Edit server config from the web
- Dependency on body-parser
- Dependency on method-override

### Changed

- Styling of web client
- Improve README

## [0.1.0] - 2015-09-04

### Added

- Crash report server and web client
- Dependency on basic-auth
- Dependency on express
- Dependency on ini
- Dependency on lodash
- Dependency on multiparty
- Dependency on node-uuid
- Dependency on nodemailer
- Dependency on pouchdb
- Dependency on virtual-dom

[unreleased]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v2.0.1...HEAD
[2.0.1]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v2.0.0...v2.0.1
[2.0.0]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v1.2.0...v2.0.0
[1.2.0]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v1.1.0...v1.2.0
[1.1.0]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v1.1.0-rc.1...v1.1.0
[1.1.0-rc.1]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v1.0.0...v1.1.0-rc.1
[1.0.0]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v1.0.0-rc.8...v1.0.0
[1.0.0-rc.8]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v1.0.0-rc.7...v1.0.0-rc.8
[1.0.0-rc.7]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v1.0.0-rc.6...v1.0.0-rc.7
[1.0.0-rc.6]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v1.0.0-rc.5...v1.0.0-rc.6
[1.0.0-rc.5]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v1.0.0-rc.4...v1.0.0-rc.5
[1.0.0-rc.4]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v1.0.0-rc.3...v1.0.0-rc.4
[1.0.0-rc.3]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v1.0.0-rc.2...v1.0.0-rc.3
[1.0.0-rc.2]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v1.0.0-rc.1...v1.0.0-rc.2
[1.0.0-rc.1]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v0.5.6...v1.0.0-rc.1
[0.5.6]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v0.5.5...v0.5.6
[0.5.5]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v0.5.4...v0.5.5
[0.5.4]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v0.5.3...v0.5.4
[0.5.3]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v0.5.2...v0.5.3
[0.5.2]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v0.5.1...v0.5.2
[0.5.1]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v0.5.0...v0.5.1
[0.5.0]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v0.4.1...v0.5.0
[0.4.1]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v0.4.0...v0.4.1
[0.4.0]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v0.3.0...v0.4.0
[0.3.0]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v0.2.0...v0.3.0
[0.2.0]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/v0.1.0...v0.2.0
[0.1.0]:
	https://github.com/johnmuhl/electron-crash-report-server/compare/ee873ed...v0.1.0
[keep a changelog]: http://keepachangelog.com/en/1.0.0/
[semantic versioning]: http://semver.org/spec/v2.0.0.html
