#!/bin/bash

# Copyright 2024 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

SCRIPT_DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)
REPO_ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)

"$SCRIPT_DIR/build_ui.sh"

CONTAINER_NAME=splunk-ucc
APP_NAME=Splunk_TA_UCCExample
SPLUNK_PASSWORD='Chang3d!'

# Remove running docker container
docker rm -f $CONTAINER_NAME &>/dev/null

cd $REPO_ROOT_DIR

# Remove built package
rm -rf output
poetry install
poetry run ucc-gen build --source tests/testdata/test_addons/package_global_config_everything/package

chmod -R 777 output/

# running on ARM Mac
if [[ $(uname -m) == 'arm64' ]]; then
  export DOCKER_DEFAULT_PLATFORM=linux/amd64
fi

docker run \
  -v "$REPO_ROOT_DIR/output/$APP_NAME:/opt/splunk/etc/apps/$APP_NAME" \
  -p 8000:8000 \
  -p 8088:8088 \
  -p 8089:8089 \
  -p 9997:9997 \
  -e "SPLUNK_START_ARGS=--accept-license" \
  -e "SPLUNK_PASSWORD=$SPLUNK_PASSWORD" \
  -e "SPLUNK_HEC_TOKEN=4a8a737d-5452-426c-a6f7-106dca4e813f" \
  -e "SPLUNK_DISABLE_POPUPS=true" \
  -d \
  --name $CONTAINER_NAME splunk/splunk:9.1.2

echo -n "Waiting Splunk for run"
until curl -Lsk "https://localhost:8088/services/collector/health" &>/dev/null ; do echo -n "." && sleep 5 ; done

# disable caching UI assets for quick reload
curl -k -sS -u "admin:$SPLUNK_PASSWORD" https://localhost:8089/servicesNS/nobody/system/configs/conf-web/settings \
  -d cacheEntriesLimit=0 \
  -d cacheBytesLimit=0 \
  > /dev/null

python3 -m webbrowser "http://localhost:8000/en-GB/app/$APP_NAME"
