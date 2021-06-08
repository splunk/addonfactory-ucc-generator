#!/usr/bin/env bash

set -eE -v
source $HOME/.poetry/env
poetry version $1
poetry build