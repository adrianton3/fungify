#!/usr/bin/env bash

mkdir tmp
cp -r src tmp
cp -r demo tmp

git checkout gh-pages

cp -r tmp/* .

rm -rf tmp