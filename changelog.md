# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- [ ] Audit vulnerabilities

### Added

- [ ] Portuguese translation.
- [ ] German Translation
- [ ] Italian translation
- [ ] French translation
- [ ] Script `edu-git-checkout`
- [ ] yaml people spectification

## [0.10.0-alpha.0] - 2024-10-13

### Added

- Script `edu-git-archive`
- Script `edu-git-sync`
- English translation and [i18n](https://www.npmjs.com/package/i18n) support
- English README (default)
- Changelog and `.markdownlint.yaml` added

### Changed

- CLI outputs improvements (refactoring colorize, sumarize...)
- gitStates colors

### Fixed

- [x] Path del repo de archivo bare (iss #6)

## [0.9.2-alpha] - 2024-10-13

This was the first version released on npm, resulting from some bash scripts that were migrated to node and python.

### Added

- Script `edu-git-remote`
- Script `edu-git-fetch`
- Logging with [winston](https://www.npmjs.com/package/winston)
- Enhanced CLI with yargs and [chalk](https://www.npmjs.com/package/chalk)
- Parser csv con [papaparse](https://www.npmjs.com/package/papaparse)
- Configs with [dotenv](https://www.npmjs.com/package/dotenv)
