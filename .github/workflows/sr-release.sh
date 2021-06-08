#!/usr/bin/env bash

set -eE
set -v
source $HOME/.poetry/env ;poetry publish 
echo pypy user=$${PYPI_USERNAME}
poetry publish -n -u ${PYPI_USERNAME} -p ${PYPI_TOKEN}