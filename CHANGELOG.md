# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!--
## [Unreleased] - Date
[Unreleased]: https://github.com/serianox/bishop/compare/v1.5.2...unreleased
### Added
### Changed
### Fixed
-->

## [1.5.3] - 2018-05-11
[1.5.3]: https://github.com/serianox/bishop/compare/v1.5.3...v1.5.2
### Changed
- add execution times in stdout
### Fixed
- detect cycles in dependencies

## [1.5.2] - 2018-05-10
[1.5.2]: https://github.com/serianox/bishop/compare/v1.5.1...v1.5.2
### Fixed
- don't run a task when all its dependencies are not complete

## [1.5.1] - 2018-05-08
[1.5.1]: https://github.com/serianox/bishop/compare/v1.5.0...v1.5.1
### Fixed
- correctly print version in help

## [1.5.0] - 2018-05-08
[1.5.0]: https://github.com/serianox/bishop/compare/v1.4.0...v1.5.0
### Added
- add --silent switch

## [1.4.0] - 2018-04-29
[1.4.0]: https://github.com/serianox/bishop/compare/v1.3.0...v1.4.0
### Added
- interpolate command strings with options
- parse options given in the command line
- use environment variable when interpolating command strings
- access jobs count in options
### Changed
- reduce noise for errors

## [1.3.0] - 2018-04-28
[1.3.0]: https://github.com/serianox/bishop/compare/v1.2.0...v1.3.0
### Added
- add sugar for true values

## [1.2.0] - 2018-04-28
[1.2.0]: https://github.com/serianox/bishop/compare/v1.1.0...v1.2.0
### Added
- allow to specify the number of jobs per task

## [1.1.0] - 2018-04-28
[1.1.0]: https://github.com/serianox/bishop/compare/v1.0.0...v1.1.0
### Added
- print stdout/stderr of running tasks
- allow tasks to be silent

## 1.0.0 - 2018-04-28
