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

# Ensure there are exactly two arguments provided
if [[ "$#" -ne 3 ]]; then
  echo "Usage: $0 <path to base HTML file> <path to script HTML file> <rum_access_token>"
  exit 1
fi

source_html_file=$1
target_html_file=$2
rum_access_token=$3

# Ensure both files exist
if [[ ! -f "$target_html_file" ]] || [[ ! -f "$source_html_file" ]]; then
  echo "Both files must exist."
  exit 1
fi

# Fill token in script
sed -i "s/RUM_ACCESS_TOKEN/$rum_access_token/g" "$target_html_file"

# Fill base.html with script
sed -i "\|<head>|r $target_html_file" "$source_html_file"

