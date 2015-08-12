SRC = $(wildcard src/*.js)
LIB = $(SRC:src/%.js=lib/%.js)

default: lib run

lib: $(LIB)
lib/%.js: src/%.js
	mkdir -p $(@D)
	babel --modules common $< -o $@

run:
	npm start

