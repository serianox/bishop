.PHONY: ci
ci: lint build test cov-cli codecov

.PHONY: commit
commit: lint build test cov-cli cov-html doc

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
	nyc --reporter=json mocha --ui tdd --use_strict dist/test/**/*.test.js || true

.PHONY: build
build: transpile
	cp -r bin dist

.PHONY: transpile
transpile:
	tsc

.PHONY: lint
lint:
	tsfmt -v &&\
	tslint -c tslint.json -p tsconfig.json || true

.PHONY: doc
doc:
	typedoc --out ./doc --json ./doc/doc.json --theme default --module commonjs
