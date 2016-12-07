import fs from "fs";
import {execSync} from "child_process";

function rmdir(path) {
  try { var files = fs.readdirSync(path); }
  catch(e) { return; }
  if (files.length > 0) {
    for (var i = 0; i < files.length; i++) {
      var filePath = path + '/' + files[i];
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      } else {
	rmdir(filePath);
      }
    }
  }
  fs.rmdirSync(path);
}

function mkdir(path) {
  fs.mkdirSync(path);
}

function cldir(path) {
  rmdir(path);
  mkdir(path);
}

function exec(cmd, args) {
  execSync(cmd, args);
}

function clean() {
  console.log("Cleaning...");
  cldir("./pub");
  cldir("./lib");
}

function compile() {
  console.log("Compiling...");
  exec("babel src --out-dir lib");
}

function bundle(debug) {
  console.log("Bundling...");
  exec("cp ./src/lexicon.js ./pub");
  exec("cp ./src/style.css ./pub");
  if (debug) {
    exec("browserify ./lib/viewer.js -s viewer > ./pub/viewer.js");
  } else {
    exec("browserify ./lib/viewer.js -s viewer | uglifyjs --screw-ie8 > ./pub/viewer.js");
  }
}

function build(debug) {
  let t0 = Date.now();
  clean();
  compile();
  bundle(debug);
  console.log("Build completed in " + (Date.now() - t0) + " ms");
}

build(true);
