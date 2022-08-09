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
import dunamai

from splunk_add_on_ucc_framework import exceptions


def get_version_from_git():
    version = dunamai.Version.from_git()
    if not version.stage:
        stage = "R"
    else:
        stage = version.stage[:1]
    try:
        version.serialize(metadata=True, style=dunamai.Style.SemVer)
    except ValueError:
        raise exceptions.CouldNotVersionFromGitException()
    return f"{version.base}{stage}{version.commit}"
