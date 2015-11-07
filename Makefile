SRC = $(wildcard src/*.js)
LIB = $(SRC:src/%.js=lib/%.js)
PUB = $(LIB:lib/%.js=pub/%.js)

default: lib pub run

lib: $(LIB)
pub: $(PUB)
lib/%.js: src/%.js
	mkdir -p $(@D)
	babel --modules common $< -o $@

pub/%.js: lib/%.js
	mkdir -p $(@D)
	browserify lib/assert.js lib/viewer.js > pub/viewer.js

run:
	npm start

