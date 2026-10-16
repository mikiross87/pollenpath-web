#!/bin/sh
# Files in the repo that aren't part of the site must not be served (WEB-18).
# Cloudflare Pages publishes the repo root, so functions/_middleware.js answers
# 404 for the paths listed in _routes.json.
#
# Usage: scripts/check-private-paths.sh [base-url]
#   base-url defaults to https://pollenpath.app; for a local run use
#   `wrangler pages dev . --port 8789` and pass http://localhost:8789

base=${1:-https://pollenpath.app}
fail=0

expect() {
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$base$2")
  if [ "$code" = "$1" ]; then
    echo "ok    $code $2"
  else
    echo "FAIL  $code $2 (expected $1)"
    fail=1
  fi
}

expect 404 /docs/superpowers/design-source/app.js
expect 404 /docs/superpowers/plans/2026-05-31-web-landing-redesign-port.md
expect 404 /.gitignore
expect 404 /scripts/check-private-paths.sh
expect 404 /functions/_middleware.js
expect 200 /
expect 200 /site.css
expect 200 /press/pollenpath-1.0-screenshots.zip

exit $fail
