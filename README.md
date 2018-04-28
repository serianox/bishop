# Bishop
[![Build Status][travis-image]][travis-url]
[![Issues Coverage][codecov-image]][codecov-url]
[![Maintainability][codeclimate-image]][codeclimate-url]
[![Dependency Status][dependencyci-image]][dependencyci-url]

[travis-url]: https://travis-ci.org/serianox/bishop
[travis-image]: https://travis-ci.org/serianox/bishop.svg

[codecov-url]: https://codecov.io/gh/serianox/bishop
[codecov-image]: https://codecov.io/gh/serianox/bishop/branch/master/graph/badge.svg

[codeclimate-url]: https://codeclimate.com/github/serianox/bishop/maintainability
[codeclimate-image]: https://api.codeclimate.com/v1/badges/9873c1075d2af8ade0ac/maintainability

[dependencyci-url]: https://dependencyci.com/github/serianox/bishop
[dependencyci-image]: https://dependencyci.com/github/serianox/bishop/badge

Bishop is a build tool to declare, visualize and run tasks and their dependencies in a build pipeline.

Bishop is built with Bishop.

## Usage

```
  Usage: bs [options] <task ...>

  Options:

    -V, --version      output the version number
    -f, --file <file>  bishop file
    -j, --jobs <jobs>  number of jobs to start in parallel
    -S, --simulate     simulate operations
    -d, --debug        set verbose
    -h, --help         output usage information
```

## Bishop file syntax

Below is how running tests for Bishop is declared. You can view the full .bishop file [here](https://github.com/serianox/bishop/blob/master/.bishop). 

```
test: build
	cmd = nyc --reporter=json mocha --require source-map-support/register --ui tdd --use_strict dist/test/**/*.test.js
	allow-failure = true
```

## License

Bishop is published under [LPRAB](https://raw.githubusercontent.com/serianox/bishop/master/LICENCE) or [WTFPL](https://raw.githubusercontent.com/serianox/bishop/master/LICENSE).
