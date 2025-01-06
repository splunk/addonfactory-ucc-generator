#! /usr/bin/env bash

# Copyright 2025 Splunk Inc.
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

# The script installs 2 different version of the `splunk-add-on-ucc-framework`,
# builds the add-on, cleans up some folders and then prints the difference between
# the 2 built versions.
#
# The script assumes uses `python3` binary (you can change it for your needs) and needs
# 2 versions of the `splunk-add-on-ucc-framework` as parameters.
# An example of calling the script:
# `./compare_ucc_versions 5.19.0 5.24.0`

set -euo pipefail

python3 -m venv .venv
source .venv/bin/activate

rm -rf output_$1
rm -rf output_$2

echo "Installing splunk-add-on-ucc-framework==$1"
pip install splunk-add-on-ucc-framework==$1 > /dev/null 2>&1
.venv/bin/ucc-gen > /dev/null 2>&1
mv output/ output_$1/

echo "Installing splunk-add-on-ucc-framework==$2"
pip install splunk-add-on-ucc-framework==$2 > /dev/null 2>&1
.venv/bin/ucc-gen > /dev/null 2>&1
mv output/ output_$2/

echo "Removing lib/ and appserver/static/jb/"
rm -rf output_$1/*/lib/
rm -rf output_$2/*/lib/
rm -rf output_$1/*/appserver/static/js/
rm -rf output_$2/*/appserver/static/js/

diff -bur output_$1 output_$2

rm -rf output_$1
rm -rf output_$2

deactivate
