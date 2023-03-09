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
import os
import tempfile
from unittest import mock

from splunk_add_on_ucc_framework import app_conf as app_conf_lib
from tests.unit.helpers import get_testdata_file, get_testdata_file_path


@mock.patch("time.time", mock.MagicMock(return_value=12345))
def test_update():
    app_conf = app_conf_lib.AppConf()
    app_conf.read(get_testdata_file_path("app.conf"))
    app_manifest_mock = mock.MagicMock()
    app_manifest_mock.get_description.return_value = (
        "Description for Splunk_TA_UCCExample"
    )
    app_manifest_mock.get_addon_name.return_value = "Splunk_TA_UCCExample"
    app_manifest_mock.get_title.return_value = "Title for Splunk_TA_UCCExample"
    app_manifest_mock.get_authors.return_value = [
        {
            "name": "Company name",
            "email": "email@example.com",
            "company": "Company name",
        },
    ]
    app_conf.update(
        "1.0.0",
        app_manifest_mock,
        [
            "splunk_ta_uccexample_settings",
            "splunk_ta_uccexample_accounts",
        ],
    )
    with tempfile.TemporaryDirectory() as temp_dir:
        output_app_conf_path = os.path.join(temp_dir, app_conf_lib.APP_CONF_FILE_NAME)
        app_conf.write(output_app_conf_path)
        app_conf_expected = get_testdata_file("app.conf.updated")
        with open(output_app_conf_path) as output_app_conf_fd:
            assert app_conf_expected == output_app_conf_fd.read()


@mock.patch("time.time", mock.MagicMock(return_value=12345))
def test_update_when_minimal_app_conf():
    app_conf = app_conf_lib.AppConf()
    app_conf.read(get_testdata_file_path("app.conf.minimal"))
    app_manifest_mock = mock.MagicMock()
    app_manifest_mock.get_description.return_value = (
        "Description for Splunk_TA_UCCExample"
    )
    app_manifest_mock.get_addon_name.return_value = "Splunk_TA_UCCExample"
    app_manifest_mock.get_title.return_value = "Title for Splunk_TA_UCCExample"
    app_manifest_mock.get_authors.return_value = [
        {
            "name": "Company name",
            "email": "email@example.com",
            "company": "Company name",
        },
    ]
    app_conf.update(
        "1.0.0",
        app_manifest_mock,
        [],
    )
    with tempfile.TemporaryDirectory() as temp_dir:
        output_app_conf_path = os.path.join(temp_dir, app_conf_lib.APP_CONF_FILE_NAME)
        app_conf.write(output_app_conf_path)
        app_conf_expected = get_testdata_file("app.conf.minimal.updated")
        with open(output_app_conf_path) as output_app_conf_fd:
            assert app_conf_expected == output_app_conf_fd.read()
