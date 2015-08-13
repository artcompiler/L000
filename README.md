### Making an Art Compiler

# Steps include:

* Clone this repo which contains a prototypical art compiler into a renamed repo (e.g. L201).
* Clone the GC repo (https://github.com/artcompiler/graffiticode).
* Design a language that allows you to say things that are interesting and beatiful.
* Edit ./pub/lexicon.js to define a vocabulary for that language.
* Edit ./src/compiler.js to translate the ASTs produced from GC into object code that expresses the output of that language.
* Edit ./pub/viewer.js to render that object code in an interesting and beautiful way.
* Start your compiler as a local service (make).
* Start GC as a local server (node app).
* Visit your local GC server (e.g. http://localhost:3000/lang?id=201) and test.
* Repeat until you are have done something interesting.
* Create an Art Compiler project on Heroku for your new language (e.g. l201-artcompiler)
* Push your latest changes.
* Go to the live GC server (e.g. http://graffiticode.com/l201) and play with your language.

# Write about it

* Document issues by creating bugs in this repo.
* Edit this readme file to expand on these instructions
* Create a new wiki page to document what you've learned
