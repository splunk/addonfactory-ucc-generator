#!/usr/bin/env bash

set -eE
set -v
# shellcheck disable=SC1091,SC2086
source $HOME/.poetry/env
poetry build