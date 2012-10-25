#!/bin/sh
# update gh-pages branch with latest doc files and specs

git checkout gh-pages

# ---

# purge old
rm -r docs/
rm test/01.js test/hasher.js test/signals.js

# copy new
git checkout master dist
git checkout master dev

# docs
mv dist/docs .

# tests
mv dev/lib/signals.js test/signals.js
mv dev/tests/unit/01.js test/01.js
mv dist/js/hasher.js test/hasher.js

# cleanup
rm -r dev/
rm -r dist/

# ----

# commit
git add -A
git commit
git checkout master
