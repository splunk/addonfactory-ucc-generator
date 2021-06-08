#!/usr/bin/env bash

set -eE -v


source $HOME/.poetry/env ;poetry publish 
echo pypy user=$${PYPI_USERNAME}
poetry publish -u ${PYPI_USERNAME} -p ${PYPI_TOKEN}