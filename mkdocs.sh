#!/usr/bin/env bash
set -euo pipefail

VENV=.docs-venv

if [ ! -d "$VENV" ]; then
    trap 'rm -rf "$VENV"' ERR
    python3 -m venv "$VENV"
    "$VENV/bin/pip" install --quiet --upgrade pip
    "$VENV/bin/pip" install --quiet .
    "$VENV/bin/pip" install --quiet -r docs/requirements.txt
    trap - ERR
fi

exec "$VENV/bin/mkdocs" "$@"
