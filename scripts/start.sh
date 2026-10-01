#!/bin/sh
set -e

WATCH=
if [ "$1" = "--watch" ]; then
  WATCH="--watch"
  shift
fi

case "$npm_config_user_agent" in
  bun/*)
    exec bun $WATCH "$@"
    ;;
  deno/*)
    exec deno $WATCH run --allow-net --allow-read --allow-write "$@"
    ;;
  *)
    exec node $WATCH "$@"
    ;;
esac