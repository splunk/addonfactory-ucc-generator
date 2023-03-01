#
# Copyright 2021 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
docker run \
  -v "$PWD/output:/opt/splunk/etc/apps/" \
  -p 8000:8000 \
  -p 8088:8088 \
  -p 8089:8089 \
  -p 9997:9997 \
  -e "SPLUNK_START_ARGS=--accept-license" \
  -e "SPLUNK_PASSWORD=Chang3d!" \
  -e "SPLUNK_HEC_TOKEN=4a8a737d-5452-426c-a6f7-106dca4e813f" \
  -d \
  --rm \
  --name splunk splunk/splunk:${1:-latest}
