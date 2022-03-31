#!/usr/bin/env bash
set -e
git add .
git commit -m "npm publish"
npm version patch
git push