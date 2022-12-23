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
from unittest import mock

import dunamai
import pytest

from splunk_add_on_ucc_framework import exceptions, utils


@mock.patch("splunk_add_on_ucc_framework.utils.dunamai.Version", autospec=True)
def test_get_version_from_git_when_tags_are_not_semver(mock_version_class):
    mock_version = mock.MagicMock()
    mock_version.serialize.side_effect = ValueError
    mock_version_class.from_git.return_value = mock_version

    with pytest.raises(exceptions.CouldNotVersionFromGitException):
        utils.get_version_from_git()


@mock.patch("splunk_add_on_ucc_framework.utils.dunamai.Version.from_git", autospec=True)
def test_get_version_from_git_when_(mock_version_from_git):
    version = dunamai.Version("2.2.1", stage=("b", 2), distance=16, commit="2e0d120")
    mock_version_from_git.return_value = version

    expected_result = "2.2.1b2e0d120"
    assert expected_result == utils.get_version_from_git()


def test_dump_json_config(tmp_path):
    tmp_file_to_dump = tmp_path / "globalConfig.json"
    config = {"hello": "world", "test": "config_to_dump"}

    utils.dump_json_config(config, str(tmp_file_to_dump))

    # Due to usage of end-of-line check in the add-on's repositories,
    # we need to ensure that the empty line is being added to the end of the
    # file, otherwise it conflicts with `pre-commit` configuration and
    # `pre-commit` tries to add it again before commit.
    expected_content = """{
    "hello": "world",
    "test": "config_to_dump"
}
"""

    with open(tmp_file_to_dump) as f:
        content = f.read()

    assert expected_content == content


def test_dump_yaml_config(tmp_path):
    tmp_file_to_dump = tmp_path / "globalConfig.yaml"
    config = {"hello": "world", "test": "config_to_dump"}

    utils.dump_yaml_config(config, str(tmp_file_to_dump))

    expected_content = "hello: world\ntest: config_to_dump\n"

    with open(tmp_file_to_dump) as f:
        content = f.read()

    assert expected_content == content
