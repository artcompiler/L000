default: build run

build:
	compile-modules convert ./src/compile.js > ./lib/compile.js

run:
	npm start

