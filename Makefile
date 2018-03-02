.PHONY: ci
ci: lint style build test cov-cli codecov doc

.DEFAULT_GOAL := default
.PHONY: default
default:
	yarn run make commit

.PHONY: commit
commit: build test cov-cli

.PHONY: codecov
codecov: test
	codecov -f coverage/*.json

.PHONY: cov-html
cov-html: test
	nyc report --reporter=html

.PHONY: cov-cli
cov-cli: test
	nyc report

.PHONY: test
test: build
	nyc --reporter=json mocha --require source-map-support/register --ui tdd --use_strict dist/test/**/*.test.js || true

.PHONY: build
build: transpile
	cp -rpu bin dist

.PHONY: transpile
transpile:
	tsc

.PHONY: fmt
fmt:
	tsfmt --replace

.PHONY: style
style:
	tsfmt --verify || true

.PHONY: lint
lint:
	tslint -c tslint.json -p tsconfig.json || true

.PHONY: doc
doc:
	typedoc --mode modules --out ./doc ./lib --json ./doc/doc.json --theme minimal
